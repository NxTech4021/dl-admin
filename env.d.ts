declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_HOST_URL: string;
    NEXT_PUBLIC_AUTH_URL: string;
    NODE_ENV: "development" | "production" | "staging";
  }
}
