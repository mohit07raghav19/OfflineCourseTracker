import { useCourse } from "../../context/CourseContext";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import PDFViewer from "../PDFViewer/PDFViewer";
import MarkdownViewer from "../MarkdownViewer/MarkdownViewer";
import HTMLViewer from "../HTMLViewer/HTMLViewer";
import TextViewer from "../TextViewer/TextViewer";
import ImageViewer from "../ImageViewer/ImageViewer";
import styles from "./ContentViewer.module.css";

const ContentViewer = () => {
  const { currentFile } = useCourse();

  console.log("[ContentViewer] currentFile:", {
    name: currentFile?.name,
    type: currentFile?.fileType,
    path: currentFile?.path,
  });

  if (!currentFile) {
    return (
      <div className={styles.empty}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
        </svg>
        <h2>No File Selected</h2>
        <p>Select a file from the sidebar to start learning</p>
      </div>
    );
  }

  const renderViewer = () => {
    switch (currentFile.fileType) {
      case "video":
        return <VideoPlayer file={currentFile} />;
      case "document":
        return <PDFViewer file={currentFile} />;
      case "markdown":
        return <MarkdownViewer file={currentFile} />;
      case "html":
        return <HTMLViewer file={currentFile} />;
      case "text":
        return <TextViewer file={currentFile} />;
      case "image":
        return <ImageViewer file={currentFile} />;
      default:
        return (
          <div className={styles.unsupported}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <h3>Unsupported File Type</h3>
            <p>{currentFile.name}</p>
          </div>
        );
    }
  };

  return <div className={styles.contentViewer}>{renderViewer()}</div>;
};

export default ContentViewer;
