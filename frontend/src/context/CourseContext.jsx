import { createContext, useContext, useState, useCallback } from "react";
import * as fileSystemService from "../services/fileSystemService";

const CourseContext = createContext();

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within CourseProvider");
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileURLCache, setFileURLCache] = useState(new Map());
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Load a course from directory handle (browser-based)
  const loadCourse = useCallback(async (dirHandle) => {
    setLoading(true);
    setError(null);

    try {
      // Scan directory structure
      const structure = await fileSystemService.scanDirectory(dirHandle);

      // Get flat file list
      const fileList = fileSystemService.flattenFileStructure(structure);
      const totalFiles = fileList.length;

      // Load progress from localStorage
      const progressData = fileSystemService.loadProgress(dirHandle.name);

      const courseData = {
        id: dirHandle.name,
        name: dirHandle.name,
        structure: structure,
        files: fileList,
        totalFiles: totalFiles,
        dirHandle: dirHandle,
        loadedAt: Date.now(),
      };

      setCourse(courseData);
      setProgress(progressData);

      // Set first file as current
      if (fileList.length > 0) {
        setCurrentFile(fileList[0]);
      }

      return { course: courseData, progress: progressData };
    } catch (err) {
      console.error("Error loading course:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all files in flat order
  const getAllFiles = useCallback(() => {
    if (!course) return [];
    return course.files || [];
  }, [course]);

  // Get next file
  const getNextFile = useCallback(() => {
    if (!currentFile) return null;

    const allFiles = getAllFiles();
    const currentIndex = allFiles.findIndex((f) => f.path === currentFile.path);

    if (currentIndex >= 0 && currentIndex < allFiles.length - 1) {
      return allFiles[currentIndex + 1];
    }

    return null;
  }, [currentFile, getAllFiles]);

  // Get previous file
  const getPreviousFile = useCallback(() => {
    if (!currentFile) return null;

    const allFiles = getAllFiles();
    const currentIndex = allFiles.findIndex((f) => f.path === currentFile.path);

    if (currentIndex > 0) {
      return allFiles[currentIndex - 1];
    }

    return null;
  }, [currentFile, getAllFiles]);

  // Navigate to next file
  const goToNext = useCallback(() => {
    const nextFile = getNextFile();
    if (nextFile) {
      setCurrentFile(nextFile);
    }
  }, [getNextFile]);

  // Navigate to previous file
  const goToPrevious = useCallback(() => {
    const previousFile = getPreviousFile();
    if (previousFile) {
      setCurrentFile(previousFile);
    }
  }, [getPreviousFile]);

  // Update progress for current file
  const updateProgress = useCallback(
    async (progressData) => {
      if (!course || !currentFile) return;

      try {
        const updatedProgress = fileSystemService.updateFileProgress(
          course.id,
          currentFile.path,
          progressData
        );
        setProgress(updatedProgress);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    },
    [course, currentFile]
  );

  // Toggle completion status
  const toggleCompletion = useCallback(
    async (file) => {
      if (!course) return;

      try {
        const updatedProgress = fileSystemService.toggleFileCompletion(
          course.id,
          file.path
        );
        setProgress(updatedProgress);
      } catch (err) {
        console.error("Failed to toggle completion:", err);
      }
    },
    [course]
  );

  // Get file progress
  const getFileProgress = useCallback(
    (file) => {
      if (!progress || !file) return null;
      return progress.files[file.path] || null;
    },
    [progress]
  );

  // Calculate overall progress percentage
  const getOverallProgress = useCallback(() => {
    if (!progress || !course) return 0;

    const totalFiles = course.totalFiles;
    const completedFiles = Object.values(progress.files).filter(
      (p) => p.completed
    ).length;

    return totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;
  }, [progress, course]);

  // Get file URL for viewing
  const getFileURL = useCallback(
    async (file) => {
      if (!file || !file.handle) return null;

      // Check cache first
      if (fileURLCache.has(file.path)) {
        return fileURLCache.get(file.path);
      }

      try {
        const url = await fileSystemService.createFileURL(file.handle);
        setFileURLCache((prev) => new Map(prev).set(file.path, url));
        return url;
      } catch (err) {
        console.error("Failed to create file URL:", err);
        return null;
      }
    },
    [fileURLCache]
  );

  // Clean up file URLs on unmount
  const cleanupFileURLs = useCallback(() => {
    fileURLCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    setFileURLCache(new Map());
  }, [fileURLCache]);

  // Expand parent folders for a given file path
  const expandParentFolders = useCallback(
    (filePath) => {
      if (!filePath) return;

      const pathParts = filePath.split("/");

      // Create a completely new set with only the ancestors of this file
      const newExpanded = new Set();

      // Add all parent folder paths for the current file
      for (let i = 1; i < pathParts.length; i++) {
        const folderPath = pathParts.slice(0, i).join("/");
        newExpanded.add(folderPath);
      }

      setExpandedFolders(newExpanded);
    },
    [expandedFolders]
  );

  // Toggle folder expansion
  const toggleFolderExpansion = useCallback((folderPath) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  }, []);

  const value = {
    course,
    progress,
    currentFile,
    loading,
    error,
    loadCourse,
    setCurrentFile,
    getAllFiles,
    getNextFile,
    getPreviousFile,
    goToNext,
    goToPrevious,
    updateProgress,
    toggleCompletion,
    getFileProgress,
    getOverallProgress,
    getFileURL,
    cleanupFileURLs,
    expandedFolders,
    expandParentFolders,
    toggleFolderExpansion,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
