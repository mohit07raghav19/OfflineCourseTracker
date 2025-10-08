import { useState } from "react";
import { useCourse } from "../../context/CourseContext";
import { getFileTypeIcon } from "../../utils/fileIcons";
import styles from "./FileTree.module.css";

const FileTreeNode = ({ node, level = 0 }) => {
  const { currentFile, setCurrentFile, getFileProgress, toggleCompletion } =
    useCourse();
  const [isExpanded, setIsExpanded] = useState(level === 0); // Root expanded by default

  const isDirectory = node.type === "directory";
  const isCurrentFile = currentFile?.path === node.path;
  const fileProgress = !isDirectory ? getFileProgress(node) : null;
  const isCompleted = fileProgress?.completed || false;

  // Calculate folder completion status
  const getFolderCompletionStatus = (folderNode) => {
    if (folderNode.type !== "directory" || !folderNode.children) {
      return { completed: 0, total: 0 };
    }

    let completed = 0;
    let total = 0;

    const countFiles = (node) => {
      if (node.type === "file") {
        total++;
        const progress = getFileProgress(node);
        if (progress?.completed) {
          completed++;
        }
      } else if (node.children) {
        node.children.forEach(countFiles);
      }
    };

    folderNode.children.forEach(countFiles);
    return { completed, total };
  };

  const folderStatus = isDirectory ? getFolderCompletionStatus(node) : null;
  const folderCompletionPercentage =
    folderStatus && folderStatus.total > 0
      ? Math.round((folderStatus.completed / folderStatus.total) * 100)
      : 0;

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      setCurrentFile(node);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent triggering file selection
    toggleCompletion(node);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={styles.node}>
      <div
        className={`${styles.nodeContent} ${
          isCurrentFile ? styles.active : ""
        } ${isCompleted ? styles.completed : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isDirectory ? isExpanded : undefined}>
        {isDirectory && (
          <svg
            className={`${styles.expandIcon} ${
              isExpanded ? styles.expanded : ""
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
            height="16">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        )}

        <span className={styles.icon}>
          {isDirectory ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>
          ) : (
            getFileTypeIcon(node.fileType)
          )}
        </span>

        <span className={styles.name}>{node.name}</span>

        {/* Folder completion indicator */}
        {isDirectory && folderStatus && folderStatus.total > 0 && (
          <span
            className={styles.folderProgress}
            title={`${folderStatus.completed}/${folderStatus.total} files completed`}>
            <span className={styles.folderProgressText}>
              {folderStatus.completed}/{folderStatus.total}
            </span>
            {folderCompletionPercentage === 100 && (
              <svg
                className={styles.folderCheckmark}
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </span>
        )}

        {/* File completion checkbox */}
        {!isDirectory && (
          <button
            className={`${styles.checkbox} ${
              isCompleted ? styles.checked : ""
            }`}
            onClick={handleCheckboxClick}
            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            aria-label={
              isCompleted ? "Mark as incomplete" : "Mark as complete"
            }>
            {isCompleted ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29a.996.996 0 0 1-1.41 0L5.71 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.58 7.59z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {isDirectory && isExpanded && node.children && (
        <div className={styles.children}>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={child.path || index}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ structure }) => {
  if (!structure) return null;

  return (
    <div className={styles.fileTree}>
      <FileTreeNode node={structure} level={0} />
    </div>
  );
};

export default FileTree;
