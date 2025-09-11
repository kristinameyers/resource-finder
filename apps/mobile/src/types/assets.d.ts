// client/src/assets.d.ts

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '@neondatabase/serverless' {
  export interface PoolConfig { /* fill in if needed */ }
  export class Pool {
    constructor(config: PoolConfig);
    query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  }
  export const neonConfig: Record<string,string>;
}
