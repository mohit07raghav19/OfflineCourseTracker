import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./MarkdownViewer.module.css";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
  headerIds: true,
  mangle: false,
});

// Helper function to process images in HTML
const processMarkdownImages = async (html, markdownPath, rootHandle) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const images = doc.querySelectorAll("img");
  const loadedUrls = [];

  // Get the directory of the markdown file
  const markdownDir = markdownPath.substring(0, markdownPath.lastIndexOf("/"));

  console.log(`[MarkdownViewer] Found ${images.length} images in markdown`);
  console.log(`[MarkdownViewer] Markdown directory: ${markdownDir}`);

  for (const img of images) {
    const src = img.getAttribute("src");
    console.log(`[MarkdownViewer] Processing image src: ${src}`);

    if (
      !src ||
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:")
    ) {
      console.log(`[MarkdownViewer] Skipping external/data URL: ${src}`);
      continue; // Skip external URLs and data URLs
    }

    try {
      // Resolve relative path
      let imagePath = src;

      // Remove leading ./ if present (same directory as markdown file)
      if (src.startsWith("./")) {
        imagePath = `${markdownDir}/${src.substring(2)}`;
      }
      // Handle parent directory references
      else if (src.startsWith("../")) {
        const dirParts = markdownDir.split("/");
        const srcParts = src.split("/");
        let upCount = 0;
        while (srcParts[upCount] === "..") {
          upCount++;
        }
        const resolvedDir = dirParts
          .slice(0, dirParts.length - upCount)
          .join("/");
        imagePath = `${resolvedDir}/${srcParts.slice(upCount).join("/")}`;
      }
      // Handle absolute paths from root
      else if (src.startsWith("/")) {
        imagePath = src.substring(1); // Remove leading slash
      }
      // Relative path (same directory as markdown file)
      else {
        imagePath = `${markdownDir}/${src}`;
      }

      console.log(`[MarkdownViewer] Resolved image path: ${imagePath}`);
      console.log(`[MarkdownViewer] Root handle name: ${rootHandle.name}`);

      // Load the image file
      const imageFile = await getFileFromPath(imagePath, rootHandle);
      if (imageFile) {
        const blob = await imageFile.getFile();
        const url = URL.createObjectURL(blob);
        img.setAttribute("src", url);
        loadedUrls.push(url);
        console.log(
          `[MarkdownViewer] Successfully loaded and replaced image: ${src}`
        );
      } else {
        console.warn(`[MarkdownViewer] Image file not found: ${imagePath}`);
      }
    } catch (err) {
      console.error(`[MarkdownViewer] Failed to load image: ${src}`, err);
    }
  }

  return { html: doc.body.innerHTML, urls: loadedUrls };
};

// Helper function to get a file from a path in the directory handle
const getFileFromPath = async (path, rootHandle) => {
  const parts = path.split("/").filter(Boolean);

  // Skip the first part if it's the root folder name
  const startIndex = parts[0] === rootHandle.name ? 1 : 0;

  // Handle legacy directory handles (from file input fallback)
  if (rootHandle._isLegacy) {
    // For legacy handles, search through the tree structure
    for await (const entry of rootHandle.values()) {
      const result = await searchInEntry(entry, parts, startIndex);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // Modern File System Access API
  let currentHandle = rootHandle;

  // Navigate through directories (skip the last part which is the filename)
  for (let i = startIndex; i < parts.length - 1; i++) {
    try {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
    } catch {
      console.warn(`[MarkdownViewer] Directory not found: ${parts[i]}`);
      return null;
    }
  }

  // Get the file
  try {
    const fileName = parts[parts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    return fileHandle;
  } catch {
    console.warn(`[MarkdownViewer] File not found: ${parts[parts.length - 1]}`);
    return null;
  }
};

// Helper function to recursively search through legacy directory structure
const searchInEntry = async (entry, targetParts, currentIndex) => {
  if (currentIndex >= targetParts.length) {
    return null;
  }

  const targetName = targetParts[currentIndex];

  if (entry.name === targetName) {
    // Found matching name
    if (currentIndex === targetParts.length - 1) {
      // This is the file we're looking for
      if (entry.kind === "file") {
        return entry;
      }
    } else {
      // Need to go deeper into directories
      if (entry.kind === "directory" && entry._children) {
        for (const [, childEntry] of entry._children.entries()) {
          const result = await searchInEntry(
            childEntry,
            targetParts,
            currentIndex + 1
          );
          if (result) return result;
        }
      }
    }
  }

  return null;
};

const MarkdownViewer = ({ file }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef(null);
  const { updateProgress, course } = useCourse();
  const { sidebarOpen } = useUI();

  useEffect(() => {
    const loadMarkdownFile = async () => {
      if (!file || !file.handle) {
        setError("No file provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileHandle = await file.handle.getFile();
        const markdown = await fileHandle.text();

        // Parse markdown to HTML
        let html = marked.parse(markdown);

        // Process images in markdown
        if (course && course.dirHandle) {
          const result = await processMarkdownImages(
            html,
            file.path,
            course.dirHandle
          );
          html = result.html;
          setImageUrls(result.urls);
        }

        setHtmlContent(html);

        // Don't auto-complete - wait for scroll to bottom
      } catch (err) {
        console.error("Error loading markdown file:", err);
        setError(err.message || "Failed to load markdown file");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdownFile();
  }, [file, updateProgress, course]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Track scroll to bottom for completion
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement || hasScrolledToBottom) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold

      if (scrolledToBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        updateProgress({
          completed: true,
          lastPosition: scrollHeight,
          duration: 1,
        });
      }
    };

    contentElement.addEventListener("scroll", handleScroll);
    // Check initial state (in case content is short and doesn't need scrolling)
    handleScroll();

    return () => contentElement.removeEventListener("scroll", handleScroll);
  }, [hasScrolledToBottom, updateProgress]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading markdown file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h3>Error Loading File</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.markdownViewer}>
      <div
        className={`${styles.header} ${
          !sidebarOpen ? styles.headerPadded : ""
        }`}>
        <h2 className={styles.fileName}>{file.name}</h2>
        <span className={styles.badge}>Markdown</span>
      </div>
      <div className={styles.content} ref={contentRef}>
        <div
          className={styles.markdown}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default MarkdownViewer;
