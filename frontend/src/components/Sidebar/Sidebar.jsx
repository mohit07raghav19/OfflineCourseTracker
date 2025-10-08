import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import FileTree from "../FileTree/FileTree";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { course, getOverallProgress } = useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();

  if (!course) return null;

  const progress = getOverallProgress();

  return (
    <>
      <aside
        className={`${styles.sidebar} ${
          !sidebarOpen ? styles.sidebarClosed : ""
        }`}>
        <div className={styles.header}>
          <div className={styles.courseInfo}>
            <h2 className={styles.courseName}>{course.name}</h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}></div>
            </div>
            <p className={styles.progressText}>
              {progress}% Complete (
              {course.files.filter((f) => {
                const prog = course.progress?.files?.[f.path];
                return prog?.completed;
              }).length || 0}
              /{course.totalFiles} files)
            </p>
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              {sidebarOpen ? (
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              ) : (
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              )}
            </svg>
          </button>
        </div>

        <div className={styles.fileTreeContainer}>
          <FileTree structure={course.structure} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
