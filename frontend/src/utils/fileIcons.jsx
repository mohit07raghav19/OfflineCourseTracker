/**
 * File Type Icon Components
 * Returns SVG icons for different file types
 */

export const getFileTypeIcon = (fileType) => {
  const iconStyle = { width: "20px", height: "20px" };

  switch (fileType) {
    case "video":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      );
    case "document":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
        </svg>
      );
    case "markdown":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M3 3v18h18V3H3zm13.5 13.5h-1.5v-4.5l-1.5 1.5-1.5-1.5v4.5H10.5v-9h1.5l1.5 1.5 1.5-1.5h1.5v9z" />
        </svg>
      );
    case "html":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M12 17.56l4.07-1.13.55-6.1H9.38L9.2 8.3h7.6l.2-1.99H7l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66H7.67l.28 3.35L12 17.56zM4.07 3h15.86L18.5 19.2 12 21l-6.5-1.8L4.07 3z" />
        </svg>
      );
    case "text":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      );
    case "subtitle":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
          <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
        </svg>
      );
  }
};
