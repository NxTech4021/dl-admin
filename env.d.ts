declare namespace NodeJS {
  interface ProcessEnv {
    HOST_URL: string;
    NODE_ENV: "development" | "production" | "staging";
  }
}
