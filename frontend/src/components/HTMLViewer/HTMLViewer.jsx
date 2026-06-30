import { useState, useEffect, useRef } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./HTMLViewer.module.css";

/**
 * Resolve a relative URL from a base path string.
 * e.g. base = "Course/section1/page.html", rel = "../images/logo.png"
 *      → "Course/images/logo.png"
 */
function resolveRelativePath(basePath, relativePath) {
  if (
    !relativePath ||
    relativePath.startsWith("http") ||
    relativePath.startsWith("//") ||
    relativePath.startsWith("data:") ||
    relativePath.startsWith("blob:") ||
    relativePath.startsWith("#") ||
    relativePath.startsWith("mailto:") ||
    relativePath.startsWith("javascript:")
  ) {
    return null;
  }

  // Strip query/hash from path before resolving
  const cleanRelative = relativePath.split("?")[0].split("#")[0];
  if (!cleanRelative) return null;

  const baseParts = basePath.split("/");
  baseParts.pop(); // remove filename, keep directory

  const relParts = cleanRelative.split("/");
  for (const part of relParts) {
    if (part === "..") {
      baseParts.pop();
    } else if (part !== "." && part !== "") {
      baseParts.push(part);
    }
  }
  return baseParts.join("/");
}

/**
 * Recursively find a node in the course structure by path.
 * This searches ALL nodes (including images/CSS not shown in sidebar).
 */
function findNodeByPath(structure, targetPath) {
  if (!structure) return null;
  if (structure.path === targetPath) return structure;
  if (structure.children) {
    for (const child of structure.children) {
      const found = findNodeByPath(child, targetPath);
      if (found) return found;
    }
  }
  return null;
}

const HTMLViewer = ({ file }) => {
  // We store the processed HTML separately so we can write it
  // to the iframe AFTER the component has rendered (and iframeRef is attached)
  const [processedHTML, setProcessedHTML] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const iframeRef = useRef(null);
  const blobUrlsRef = useRef([]);

  const { updateProgress, course } = useCourse();
  const { sidebarOpen } = useUI();

  // ── Phase 1: Load and process HTML (no iframe interaction) ─────────
  useEffect(() => {
    setHasScrolledToBottom(false);
    setProcessedHTML(null);
    setError(null);
    setLoading(true);

    // Revoke previous blob URLs
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];

    if (!file?.handle) {
      setError("No file provided");
      setLoading(false);
      return;
    }

    const loadHTMLFile = async () => {
      try {
        const fileObj = await file.handle.getFile();
        let html = await fileObj.text();

        // ── Rewrite asset references to blob URLs ─────────────────
        if (course?.structure) {
          // Collect unique relative references from src/href/url()
          const refs = new Set();
          let m;

          const attrRegex = /(?:src|href|data-src)=["']([^"']+)["']/gi;
          while ((m = attrRegex.exec(html)) !== null) {
            const val = m[1];
            if (
              !val.startsWith("http") &&
              !val.startsWith("//") &&
              !val.startsWith("data:") &&
              !val.startsWith("#") &&
              !val.startsWith("mailto:") &&
              !val.startsWith("javascript:")
            ) {
              refs.add(val);
            }
          }

          const cssUrlRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
          while ((m = cssUrlRegex.exec(html)) !== null) {
            const val = m[1];
            if (
              !val.startsWith("http") &&
              !val.startsWith("//") &&
              !val.startsWith("data:")
            ) {
              refs.add(val);
            }
          }

          // Resolve all refs to blob URLs in parallel
          const resolvedMap = new Map();
          await Promise.all(
            Array.from(refs).map(async (ref) => {
              const cleanRef = ref.split("?")[0].split("#")[0];
              const resolvedPath = resolveRelativePath(file.path, cleanRef);
              if (!resolvedPath) return;

              const node = findNodeByPath(course.structure, resolvedPath);
              if (!node?.handle) return;

              try {
                const assetFile = await node.handle.getFile();
                const blobUrl = URL.createObjectURL(assetFile);
                blobUrlsRef.current.push(blobUrl);
                resolvedMap.set(ref, blobUrl);
              } catch {
                // asset not accessible — skip
              }
            })
          );

          // Replace refs in HTML (longest first to avoid partial matches)
          const sortedRefs = Array.from(resolvedMap.keys()).sort(
            (a, b) => b.length - a.length
          );
          for (const ref of sortedRefs) {
            const blobUrl = resolvedMap.get(ref);
            const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            html = html.replace(new RegExp(escaped, "g"), blobUrl);
          }
        }

        setProcessedHTML(html);
      } catch (err) {
        console.error("Error loading HTML file:", err);
        setError(err.message || "Failed to load HTML file");
      } finally {
        setLoading(false);
      }
    };

    loadHTMLFile();

    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, [file, course]);

  // ── Phase 2: Write to iframe AFTER it is mounted ──────────────────
  // The iframe is only rendered when loading=false and no error,
  // so by the time this effect runs, iframeRef.current is attached.
  useEffect(() => {
    if (!processedHTML || !iframeRef.current) return;

    const iframe = iframeRef.current;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(processedHTML);
        doc.close();

        // Forward keyboard events to parent window
        iframe.contentWindow.addEventListener("keydown", (e) => {
          const evt = new KeyboardEvent("keydown", {
            key: e.key,
            code: e.code,
            bubbles: true,
            cancelable: true,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
          });
          window.dispatchEvent(evt);
          if (evt.defaultPrevented) {
            e.preventDefault();
          }
        });
      }
    } catch (err) {
      console.error("Error writing to iframe:", err);
    }
  }, [processedHTML]);

  // ── Phase 3: Track scroll for completion ─────────────────────────
  useEffect(() => {
    if (hasScrolledToBottom || loading || !processedHTML) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const checkScroll = () => {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        const iframeWin = iframe.contentWindow;
        if (!iframeDoc || !iframeWin) return;

        const scrollTop =
          iframeWin.pageYOffset || iframeDoc.documentElement.scrollTop;
        const scrollHeight = iframeDoc.documentElement.scrollHeight;
        const clientHeight = iframeWin.innerHeight;

        if (
          scrollHeight <= clientHeight ||
          (scrollTop + clientHeight) / scrollHeight >= 0.95
        ) {
          setHasScrolledToBottom(true);
          updateProgress({ completed: true, lastPosition: scrollHeight, duration: 1 });
        }
      } catch {
        // cross-origin — ignore
      }
    };

    const iframeWin = iframe?.contentWindow;
    if (iframeWin) {
      iframeWin.addEventListener("scroll", checkScroll);
      const t1 = setTimeout(checkScroll, 800);
      const t2 = setTimeout(checkScroll, 2500);
      return () => {
        iframeWin.removeEventListener("scroll", checkScroll);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [processedHTML, loading, hasScrolledToBottom, updateProgress]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 36, height: 36 }}></div>
        <p>Loading HTML...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h3>Error Loading File</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.htmlViewer}>
      <div
        className={`${styles.header} ${!sidebarOpen ? styles.headerPadded : ""}`}
      >
        <h2 className={styles.fileName}>{file.name}</h2>
        <span className={styles.badge}>HTML</span>
      </div>
      {/* Iframe always rendered when not loading/error — so ref is attached */}
      <iframe
        ref={iframeRef}
        className={styles.iframe}
        title={file.name}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default HTMLViewer;
