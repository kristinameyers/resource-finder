/* src/@types/custom.d.ts */

/* drizzle-kit */
declare module "drizzle-kit" {
  export function defineConfig(config: unknown): unknown;
}

/* csv-parse (sync variant) */
declare module "csv-parse/sync" {
  export function parse(
    input: string | Buffer,
    options?: Record<string, unknown>
  ): any[];
}