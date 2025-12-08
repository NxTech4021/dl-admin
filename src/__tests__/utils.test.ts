import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should handle falsy values", () => {
    const result = cn("base-class", false && "hidden", null, undefined);
    expect(result).toBe("base-class");
  });

  it("should merge Tailwind classes correctly (last wins)", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
