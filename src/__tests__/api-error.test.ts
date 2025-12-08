import { getErrorMessage, isApiError } from "@/lib/api-error";

describe("API Error Utilities", () => {
  describe("isApiError", () => {
    it("should return true for axios-like errors", () => {
      const axiosError = {
        response: {
          data: { message: "Error message" },
          status: 400,
        },
        message: "Request failed",
      };
      expect(isApiError(axiosError)).toBe(true);
    });

    it("should return false for regular errors", () => {
      const regularError = new Error("Regular error");
      expect(isApiError(regularError)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from API error response", () => {
      const apiError = {
        response: {
          data: { message: "API error message" },
        },
        message: "Fallback message",
      };
      const result = getErrorMessage(apiError);
      expect(result).toBe("API error message");
    });

    it("should return error.message for standard errors", () => {
      const error = new Error("Standard error message");
      const result = getErrorMessage(error);
      expect(result).toBe("Standard error message");
    });

    it("should return fallback for unknown errors", () => {
      const result = getErrorMessage("string error", "Custom fallback");
      expect(result).toBe("Custom fallback");
    });

    it("should use default fallback when not provided", () => {
      const result = getErrorMessage({});
      expect(result).toBe("An unexpected error occurred");
    });
  });
});
