/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_ID: string;
    ISSUER: string;
  }
}
