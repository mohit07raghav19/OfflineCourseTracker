import { useState, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./TextViewer.module.css";

const TextViewer = ({ file }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateProgress } = useCourse();
  const { sidebarOpen } = useUI();

  useEffect(() => {
    const loadTextFile = async () => {
      if (!file || !file.handle) {
        setError("No file provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileHandle = await file.handle.getFile();
        const text = await fileHandle.text();
        setContent(text);

        // Mark as complete when loaded
        updateProgress({
          completed: true,
          lastPosition: 0,
          duration: 1,
        });
      } catch (err) {
        console.error("Error loading text file:", err);
        setError(err.message || "Failed to load text file");
      } finally {
        setLoading(false);
      }
    };

    loadTextFile();
  }, [file, updateProgress]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading text file...</p>
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
    <div className={styles.textViewer}>
      <div
        className={`${styles.header} ${
          !sidebarOpen ? styles.headerPadded : ""
        }`}>
        <h2 className={styles.fileName}>{file.name}</h2>
      </div>
      <div className={styles.content}>
        <pre className={styles.textContent}>{content}</pre>
      </div>
    </div>
  );
};

export default TextViewer;
