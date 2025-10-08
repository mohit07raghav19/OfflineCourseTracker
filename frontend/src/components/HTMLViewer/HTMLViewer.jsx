import { useState, useEffect, useRef } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./HTMLViewer.module.css";

const HTMLViewer = ({ file }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const iframeRef = useRef(null);
  const { updateProgress } = useCourse();
  const { sidebarOpen } = useUI();

  useEffect(() => {
    const loadHTMLFile = async () => {
      if (!file || !file.handle) {
        setError("No file provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileHandle = await file.handle.getFile();
        const html = await fileHandle.text();
        setContent(html);

        // Don't auto-complete - wait for scroll to bottom
      } catch (err) {
        console.error("Error loading HTML file:", err);
        setError(err.message || "Failed to load HTML file");
      } finally {
        setLoading(false);
      }
    };

    loadHTMLFile();
  }, [file, updateProgress]);

  // Update iframe content when HTML content changes
  useEffect(() => {
    if (content && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(content);
      iframeDoc.close();
    }
  }, [content]);

  // Track scroll to bottom for completion (monitor iframe's document)
  useEffect(() => {
    if (!iframeRef.current || hasScrolledToBottom || !content) return;

    const checkScroll = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        const iframeWindow = iframe.contentWindow;

        if (!iframeDoc || !iframeWindow) return;

        const scrollTop =
          iframeWindow.pageYOffset || iframeDoc.documentElement.scrollTop;
        const scrollHeight = iframeDoc.documentElement.scrollHeight;
        const clientHeight = iframeWindow.innerHeight;

        const scrollPercentage =
          ((scrollTop + clientHeight) / scrollHeight) * 100;

        // Mark complete if scrolled to 95% or more
        if (scrollPercentage >= 95 && !hasScrolledToBottom) {
          setHasScrolledToBottom(true);
          updateProgress({
            completed: true,
            lastPosition: scrollHeight,
            duration: 1,
          });
        }
      } catch (err) {
        // Ignore cross-origin errors
        console.log(
          "Cannot track scroll for cross-origin iframe:",
          err.message
        );
      }
    };

    const iframe = iframeRef.current;
    const iframeWindow = iframe?.contentWindow;

    if (iframeWindow) {
      iframeWindow.addEventListener("scroll", checkScroll);
      // Multiple checks with increasing delays
      const timer1 = setTimeout(checkScroll, 500);
      const timer2 = setTimeout(checkScroll, 1500);
      const timer3 = setTimeout(checkScroll, 3000);

      return () => {
        iframeWindow.removeEventListener("scroll", checkScroll);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [content, hasScrolledToBottom, updateProgress]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading HTML file...</p>
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
    <div className={styles.htmlViewer}>
      <div
        className={`${styles.header} ${
          !sidebarOpen ? styles.headerPadded : ""
        }`}>
        <h2 className={styles.fileName}>{file.name}</h2>
        <span className={styles.badge}>HTML</span>
      </div>
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
("./HTMLViewer.module.css");
