import { useState, useRef, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import FileTree from "../FileTree/FileTree";
import styles from "./Sidebar.module.css";

const Sidebar = ({ onNavigateHome }) => {
  const { course, progress: courseProgress, getOverallProgress } = useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Handle resize
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 220 && newWidth <= 560) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

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

  if (!course) return null;

  const progress = getOverallProgress();
  const completedCount =
    course.files.filter((f) => courseProgress?.files?.[f.path]?.completed).length || 0;

  return (
    <>
      {/* Floating toggle — shown when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className={styles.floatingToggle}
          onClick={toggleSidebar}
          title="Open sidebar (c)"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="18" height="18">
            <path strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
          </svg>
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ""}`}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : "0px" }}
      >
        {/* ── Header ─────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.topRow}>
            {/* Back to home */}
            <button
              className={styles.backBtn}
              onClick={onNavigateHome}
              title="Back to Home"
              aria-label="Back to home"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <span className={styles.courseTag}>Course</span>

            {/* Close sidebar */}
            <button
              className={styles.toggleBtn}
              onClick={toggleSidebar}
              title="Close sidebar (c)"
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className={styles.courseName} title={course.name}>
            {course.name}
          </h2>

          {/* Progress */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>
              {completedCount} / {course.totalFiles} complete
              <span className={styles.progressPct}>{progress}%</span>
            </span>
          </div>
        </div>

        {/* ── File tree ───────────────────────── */}
        <div className={styles.treeContainer}>
          <FileTree structure={course.structure} />
        </div>

        {/* ── Footer shortcut hint ─────────────── */}
        <div className={styles.footer}>
          <span className={styles.hintText}>
            <kbd className={styles.kbd}>?</kbd> shortcuts
            &nbsp;·&nbsp;
            <kbd className={styles.kbd}>c</kbd> sidebar
            &nbsp;·&nbsp;
            <kbd className={styles.kbd}>j</kbd><kbd className={styles.kbd}>k</kbd> / <kbd className={styles.kbd}>↑</kbd><kbd className={styles.kbd}>↓</kbd>
          </span>
        </div>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className={`${styles.resizeHandle} ${isResizing ? styles.resizing : ""}`}
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;
