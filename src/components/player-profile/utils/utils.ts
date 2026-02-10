/**
 * Get initials from a full name
 */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

/**
 * Format JSON keys into readable question text
 */
export const formatQuestionKey = (key: string): string => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([A-Z])/g, " $1") // Add space before capital letters for camelCase
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

/**
 * Format various answer types into readable strings
 */
export const formatAnswerValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    // Handle objects like skills - format them nicely
    return Object.entries(value)
      .map(([key, val]) => {
        // Format key names (remove underscores, capitalize)
        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        return `${formattedKey}: ${val}`;
      })
      .join("; ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return "N/A";
  }
  return String(value);
};
