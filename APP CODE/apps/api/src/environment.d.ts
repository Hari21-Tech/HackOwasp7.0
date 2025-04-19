declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_ORIGIN: string;
      USER: string;
      HOST: string;
      DATABASE: string;
      PASSWORD: string;
      PORT: string;
      WS_PORT: string;
      CLIENT_WS_PORT: string;
      ADMIN_WS_PORT: string;
      DB_PORT?: string;
    }
  }
}

export {};
