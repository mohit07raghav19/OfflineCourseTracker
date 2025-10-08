import { useState, useRef, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import FileTree from "../FileTree/FileTree";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { course, progress: courseProgress, getOverallProgress } = useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Handle resize start
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      // Constrain width between 200px and 600px
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  if (!course) {
    console.log("[Sidebar] No course, returning null");
    return null;
  }

  const progress = getOverallProgress();
  const completedCount =
    course.files.filter((f) => {
      const prog = courseProgress?.files?.[f.path];
      return prog?.completed;
    }).length || 0;

  return (
    <>
      {/* Floating toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className={styles.floatingToggle}
          onClick={toggleSidebar}
          title="Open sidebar"
          aria-label="Open sidebar">
          <svg
            class="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M5 7h14M5 12h14M5 17h14"
            />
          </svg>
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${
          !sidebarOpen ? styles.sidebarClosed : ""
        }`}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : undefined }}>
        <div className={styles.header}>
          <div className={styles.courseInfo}>
            <h2 className={styles.courseName}>{course.name}</h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}></div>
            </div>
            <p className={styles.progressText}>
              {progress}% Complete ({completedCount}/{course.totalFiles} files)
            </p>
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            title="Close sidebar"
            aria-label="Close sidebar">
            <svg
              class="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7.99994 10 6 11.9999l1.99994 2M11 5v14m-7 0h16c.5523 0 1-.4477 1-1V6c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Z"
              />
            </svg>
          </button>
        </div>

        <div className={styles.fileTreeContainer}>
          <FileTree structure={course.structure} />
        </div>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
