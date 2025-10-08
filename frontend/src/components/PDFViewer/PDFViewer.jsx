import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./PDFViewer.module.css";

// Configure PDF.js worker to use local bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({ file }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [renderedPages, setRenderedPages] = useState([]);
  const [currentPageInView, setCurrentPageInView] = useState(1);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const { updateProgress } = useCourse();
  const { sidebarOpen } = useUI();

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      if (!file || !file.handle) {
        setError("No file provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileHandle = await file.handle.getFile();
        const arrayBuffer = await fileHandle.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;

        setPdf(pdfDocument);
        setNumPages(pdfDocument.numPages);

        // Don't auto-complete - wait for scroll to bottom
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF file");
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [file, updateProgress]);

  // Render all pages
  useEffect(() => {
    const renderAllPages = async () => {
      if (!pdf) return;

      try {
        const pages = [];
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          pages.push({
            pageNum,
            canvas,
            width: viewport.width,
            height: viewport.height,
          });
        }
        setRenderedPages(pages);
      } catch (err) {
        console.error("Error rendering pages:", err);
      }
    };

    renderAllPages();
  }, [pdf, numPages, scale]);

  // Track which page is currently in view
  useEffect(() => {
    if (!containerRef.current || renderedPages.length === 0) return;

    let visiblePages = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.dataset.pageNum, 10);

          if (entry.isIntersecting) {
            // Store intersection ratio for this page
            visiblePages[pageNum] = entry.intersectionRatio;
          } else {
            // Remove page from visible pages when it's not intersecting
            delete visiblePages[pageNum];
          }
        });

        // Find the page with the highest intersection ratio
        const mostVisiblePage = Object.entries(visiblePages).reduce(
          (max, [pageNum, ratio]) => {
            return ratio > max.ratio
              ? { pageNum: parseInt(pageNum, 10), ratio }
              : max;
          },
          { pageNum: 1, ratio: 0 }
        );

        if (mostVisiblePage.pageNum) {
          setCurrentPageInView(mostVisiblePage.pageNum);
        }
      },
      {
        root: containerRef.current,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Track at every 1% of visibility
      }
    );

    // Observe all page elements
    Object.values(pageRefs.current).forEach((pageEl) => {
      if (pageEl) observer.observe(pageEl);
    });

    return () => {
      observer.disconnect();
    };
  }, [renderedPages]);

  // Track scroll to bottom for completion
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement || hasScrolledToBottom || numPages === 0) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = containerElement;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (scrolledToBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        updateProgress({
          completed: true,
          lastPosition: numPages,
          duration: 1,
        });
      }
    };

    containerElement.addEventListener("scroll", handleScroll);
    // Check initial state
    handleScroll();

    return () => containerElement.removeEventListener("scroll", handleScroll);
  }, [hasScrolledToBottom, numPages, updateProgress]);

  const zoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1.5);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h3>Error Loading PDF</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      <div
        className={`${styles.header} ${
          !sidebarOpen ? styles.headerPadded : ""
        }`}>
        <h2 className={styles.fileName}>{file.name}</h2>
        <div className={styles.controls}>
          <span className={styles.badge}>PDF</span>
          <span className={styles.pageInfo}>
            Page {currentPageInView} of {numPages}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Zoom Out">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
          <button
            className={styles.toolbarButton}
            onClick={zoomIn}
            disabled={scale >= 3}
            title="Zoom In">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={resetZoom}
            title="Reset Zoom">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content} ref={containerRef}>
        <div className={styles.pagesContainer}>
          {renderedPages.map((pageData) => (
            <div
              key={pageData.pageNum}
              className={styles.pageWrapper}
              ref={(el) => (pageRefs.current[pageData.pageNum] = el)}
              data-page-num={pageData.pageNum}>
              <div className={styles.pageNumber}>Page {pageData.pageNum}</div>
              <canvas
                ref={(el) => {
                  if (el && pageData.canvas) {
                    el.width = pageData.width;
                    el.height = pageData.height;
                    const ctx = el.getContext("2d");
                    ctx.drawImage(pageData.canvas, 0, 0);
                  }
                }}
                className={styles.canvas}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
