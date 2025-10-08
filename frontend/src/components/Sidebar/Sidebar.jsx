import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import FileTree from "../FileTree/FileTree";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { course, progress: courseProgress, getOverallProgress } = useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();

  console.log("[Sidebar] Render state:", {
    hasCourse: !!course,
    courseName: course?.name,
    fileCount: course?.files?.length,
    sidebarOpen,
  });

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
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      )}

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
              {progress}% Complete ({completedCount}/{course.totalFiles} files)
            </p>
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            title="Close sidebar"
            aria-label="Close sidebar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
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
