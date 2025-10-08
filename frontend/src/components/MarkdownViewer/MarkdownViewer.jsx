import { useState, useEffect } from "react";
import { marked } from "marked";
import { useCourse } from "../../context/CourseContext";
import styles from "./MarkdownViewer.module.css";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
  headerIds: true,
  mangle: false,
});

const MarkdownViewer = ({ file }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateProgress } = useCourse();

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
        const html = marked.parse(markdown);
        setHtmlContent(html);

        // Mark as complete when loaded
        updateProgress({
          completed: true,
          lastPosition: 0,
          duration: 1,
        });
      } catch (err) {
        console.error("Error loading markdown file:", err);
        setError(err.message || "Failed to load markdown file");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdownFile();
  }, [file, updateProgress]);

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
      <div className={styles.header}>
        <h2 className={styles.fileName}>{file.name}</h2>
        <span className={styles.badge}>Markdown</span>
      </div>
      <div className={styles.content}>
        <div
          className={styles.markdown}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default MarkdownViewer;
