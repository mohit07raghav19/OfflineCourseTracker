import { useState, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import styles from "./ImageViewer.module.css";

const ImageViewer = ({ file }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const { updateProgress } = useCourse();

  useEffect(() => {
    const loadImage = async () => {
      if (!file || !file.handle) {
        setError("No file provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileHandle = await file.handle.getFile();
        const url = URL.createObjectURL(fileHandle);
        setImageUrl(url);

        // Mark as complete when loaded
        updateProgress({
          completed: true,
          lastPosition: 0,
          duration: 1,
        });
      } catch (err) {
        console.error("Error loading image:", err);
        setError(err.message || "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [file, updateProgress]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const zoomIn = () => {
    setScale((prev) => Math.min(5, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.25, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const fitToScreen = () => {
    setScale(1);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading image...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h3>Error Loading Image</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.imageViewer}>
      <div className={styles.header}>
        <h2 className={styles.fileName}>{file.name}</h2>
        <div className={styles.controls}>
          <span className={styles.badge}>Image</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={zoomOut}
            disabled={scale <= 0.25}
            title="Zoom Out">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
          <button
            className={styles.toolbarButton}
            onClick={zoomIn}
            disabled={scale >= 5}
            title="Zoom In">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={resetZoom}
            title="Reset Zoom (100%)">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={fitToScreen}
            title="Fit to Screen">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={file.name}
            className={styles.image}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
