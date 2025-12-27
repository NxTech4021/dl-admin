import "@testing-library/jest-dom";

// Mock TanStack Router
jest.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    navigate: jest.fn(),
    back: jest.fn(),
  }),
  useLocation: () => ({
    pathname: "/",
    search: "",
    hash: "",
    state: {},
  }),
  Link: ({ children, ...props }: { children: React.ReactNode; to?: string }) => (
    <a href={props.to || "#"} {...props}>
      {children}
    </a>
  ),
}));

// Suppress console errors during tests (optional - remove if you want to see errors)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
