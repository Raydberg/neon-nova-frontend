declare interface Env {
  readonly NODE_ENV: string;

  NG_APP_API_URL: string;
  NG_APP_API_CLIENT_URL:string
  NG_APP_GOOGLE_CALLBACK:string
}

declare interface ImportMeta {
  readonly env: Env;
}

declare const _NGX_ENV_: Env;

V_: Env;

declare namespace NodeJS {
  export interface ProcessEnv extends Env {}
}
