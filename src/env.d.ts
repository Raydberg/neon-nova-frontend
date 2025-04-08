declare interface Env {
  readonly NODE_ENV: string;

  NG_APP_API_URL: string;
}

declare interface ImportMeta {
  readonly env: Env;
}

declare const _NGX_ENV_: Env;

declare namespace NodeJS {
  export interface ProcessEnv extends Env {}
}
