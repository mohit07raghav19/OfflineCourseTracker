import { useState } from "react";
import { useCourse } from "../../context/CourseContext";
import { getFileTypeIcon } from "../../utils/fileIcons";
import styles from "./FileTree.module.css";

const FileTreeNode = ({ node, level = 0 }) => {
  const { currentFile, setCurrentFile, getFileProgress } = useCourse();
  const [isExpanded, setIsExpanded] = useState(level === 0); // Root expanded by default

  const isDirectory = node.type === "directory";
  const isCurrentFile = currentFile?.path === node.path;
  const fileProgress = !isDirectory ? getFileProgress(node) : null;
  const isCompleted = fileProgress?.completed || false;

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      setCurrentFile(node);
    }
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

        {!isDirectory && isCompleted && (
          <svg
            className={styles.checkmark}
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
            height="16">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
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
