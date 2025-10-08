import { useState, useEffect, useRef } from "react";
import { useCourse } from "../../context/CourseContext";
import styles from "./FloatingControls.module.css";

const FloatingControls = () => {
  const {
    course,
    currentFile,
    setCurrentFile,
    getFileProgress,
    toggleCompletion,
    expandParentFolders,
  } = useCourse();
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState(() => {
    // Try to load saved position from localStorage
    const saved = localStorage.getItem("floatingControlsPosition");
    if (saved) {
      return JSON.parse(saved);
    }
    return { bottom: 24, right: 24 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const controlsRef = useRef(null);

  // Check if current file is a video
  const isVideo = currentFile?.fileType === "video";

  // Auto-hide for video files after 1 second of inactivity
  useEffect(() => {
    if (!isVideo) {
      setIsVisible(true);
      return;
    }

    // Show on mount or file change
    setIsVisible(true);

    // Hide after 1 second
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentFile, isVideo]);

  // Show controls on mouse move for video files
  useEffect(() => {
    if (!isVideo) return;

    let timeout;

    const handleMouseMove = () => {
      setIsVisible(true);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeout) clearTimeout(timeout);
    };
  }, [isVideo]);

  const currentIndex =
    course?.files?.findIndex((f) => f.path === currentFile?.path) ?? -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = course?.files && currentIndex < course.files.length - 1;
  const isCompleted = getFileProgress(currentFile)?.completed || false;

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = dragStart.x - e.clientX;
      const deltaY = dragStart.y - e.clientY;

      setPosition((prev) => ({
        bottom: Math.max(
          0,
          Math.min(window.innerHeight - 100, prev.bottom + deltaY)
        ),
        right: Math.max(
          0,
          Math.min(window.innerWidth - 200, prev.right + deltaX)
        ),
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem(
        "floatingControlsPosition",
        JSON.stringify(position)
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  if (!course || !currentFile) return null;

  const handleMouseDown = (e) => {
    // Only allow dragging from the container background, not buttons
    if (
      e.target === controlsRef.current ||
      e.target.closest("[data-drag-handle]")
    ) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

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

  const handleToggleCompletion = () => {
    toggleCompletion(currentFile);
  };

  return (
    <div
      ref={controlsRef}
      className={`${styles.floatingControls} ${
        !isVisible ? styles.hidden : ""
      } ${isDragging ? styles.dragging : ""}`}
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
      }}
      onMouseDown={handleMouseDown}>
      <div className={styles.dragHandle} data-drag-handle title="Drag to move">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
        </svg>
      </div>
      <button
        className={styles.controlButton}
        onClick={handlePrevious}
        disabled={!hasPrevious}
        title="Previous file (Arrow Left / P)"
        aria-label="Previous file">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <button
        className={`${styles.controlButton} ${styles.completionButton} ${
          isCompleted ? styles.completed : ""
        }`}
        onClick={handleToggleCompletion}
        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}>
        {isCompleted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29a.996.996 0 0 1-1.41 0L5.71 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.58 7.59z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>

      <button
        className={styles.controlButton}
        onClick={handleNext}
        disabled={!hasNext}
        title="Next file (Arrow Right / N)"
        aria-label="Next file">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingControls;
