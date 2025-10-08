import { API_BASE_URL } from "../utils/constants";

// Base fetch wrapper with error handling
const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// API methods
export const api = {
  // Course endpoints
  course: {
    load: async (path) => {
      return fetchAPI("/course/load", {
        method: "POST",
        body: JSON.stringify({ path }),
      });
    },

    get: async (courseId) => {
      return fetchAPI(`/course/${courseId}`);
    },

    getStructure: async (courseId) => {
      return fetchAPI(`/course/${courseId}/structure`);
    },
  },

  // Progress endpoints
  progress: {
    get: async (courseId) => {
      return fetchAPI(`/progress/${courseId}`);
    },

    update: async (courseId, filePath, progressData) => {
      return fetchAPI(`/progress/${courseId}`, {
        method: "POST",
        body: JSON.stringify({
          filePath,
          ...progressData,
        }),
      });
    },

    toggleCompletion: async (courseId, filePath) => {
      return fetchAPI(`/progress/${courseId}/toggle`, {
        method: "POST",
        body: JSON.stringify({ filePath }),
      });
    },
  },

  // File endpoint
  getFileUrl: (courseId, filePath) => {
    return `${API_BASE_URL}/files/${courseId}/${filePath}`;
  },
};

export default api;
