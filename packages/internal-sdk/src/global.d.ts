interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_SOCKET_URL?: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
