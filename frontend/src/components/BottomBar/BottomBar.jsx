import { useState, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import styles from "./BottomBar.module.css";

const BottomBar = () => {
  const {
    course,
    currentFile,
    setCurrentFile,
    getFileProgress,
    toggleCompletion,
    expandParentFolders,
  } = useCourse();
  const [isVisible, setIsVisible] = useState(true);

  const isVideo = currentFile?.fileType === "video";

  // For non-video: always visible.
  // For video: auto-hide, show on mouse move.
  useEffect(() => {
    if (!isVideo) {
      setIsVisible(true);
      return;
    }

    setIsVisible(true);
    const timeout = setTimeout(() => setIsVisible(false), 1500);
    return () => clearTimeout(timeout);
  }, [currentFile, isVideo]);

  useEffect(() => {
    if (!isVideo) return;

    let timeout;
    const handleMouseMove = () => {
      setIsVisible(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), 1500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeout) clearTimeout(timeout);
    };
  }, [isVideo]);

  if (!course || !currentFile) return null;

  const currentIndex =
    course?.files?.findIndex((f) => f.path === currentFile?.path) ?? -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = course?.files && currentIndex < course.files.length - 1;
  const isCompleted = getFileProgress(currentFile)?.completed || false;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevFile = course.files[currentIndex - 1];
      setCurrentFile(prevFile);
      expandParentFolders(prevFile.path);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextFile = course.files[currentIndex + 1];
      setCurrentFile(nextFile);
      expandParentFolders(nextFile.path);
    }
  };

  const handleToggleCompletion = () => toggleCompletion(currentFile);

  const barClass = `${styles.bottomBar} ${!isVisible ? styles.hidden : ""}`;

  return (
    <div className={barClass}>
      {/* File info — shown for non-video */}
      {!isVideo && (
        <div className={styles.fileInfo}>
          <span className={styles.fileName} title={currentFile.name}>
            {currentFile.name}
          </span>
          <span className={styles.fileIndex}>
            {currentIndex + 1} / {course.files.length}
          </span>
        </div>
      )}

      {isVideo && <div style={{ flex: 1 }} />}

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={handlePrevious}
          disabled={!hasPrevious}
          title="Previous file (↑ / p)"
          aria-label="Previous file"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span>Prev</span>
        </button>

        <button
          className={`${styles.controlButton} ${styles.completionButton} ${isCompleted ? styles.completed : ""}`}
          onClick={handleToggleCompletion}
          title={isCompleted ? "Unmark as completed" : "Mark as completed"}
          aria-label={isCompleted ? "Unmark as completed" : "Mark as completed"}
        >
          {isCompleted ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29a.996.996 0 0 1-1.41 0L5.71 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.58 7.59z" />
              </svg>
              <span>Completed</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
              <span>Mark done</span>
            </>
          )}
        </button>

        <button
          className={styles.controlButton}
          onClick={handleNext}
          disabled={!hasNext}
          title="Next file (↓ / n)"
          aria-label="Next file"
        >
          <span>Next</span>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
