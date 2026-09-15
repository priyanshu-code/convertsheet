import * as duckdb from "@duckdb/duckdb-wasm";
import { TabularData } from "@/types/converter";

/**
 * Interface representing the DuckDB client operations required by ConvertSheet engines.
 */
export interface IDuckDbClient {
  init(): Promise<duckdb.AsyncDuckDB>;
  registerFileBuffer(fileName: string, buffer: Uint8Array): Promise<void>;
  dropFile(fileName: string): Promise<void>;
  copyFileToBuffer(fileName: string): Promise<Uint8Array>;
  queryTabular(sql: string, maxRows?: number): Promise<TabularData>;
  execute(sql: string): Promise<void>;
  terminate(): Promise<void>;
}

/**
 * Singleton client managing the DuckDB-Wasm virtual machine, Web Worker,
 * in-memory file buffers, and analytical SQL transformations.
 */
export class DuckDbClient implements IDuckDbClient {
  private static instance: DuckDbClient | null = null;
  private db: duckdb.AsyncDuckDB | null = null;
  private initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

  public static getInstance(): DuckDbClient {
    if (!DuckDbClient.instance) {
      DuckDbClient.instance = new DuckDbClient();
    }
    return DuckDbClient.instance;
  }

  /**
   * Resets the singleton instance (useful for testing).
   */
  public static resetInstance(): void {
    DuckDbClient.instance = null;
  }

  /**
   * Lazily initializes the DuckDB-Wasm database.
   * Loads bundles from CDN and instantiates within a Web Worker.
   */
  public async init(): Promise<duckdb.AsyncDuckDB> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const bundles = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(bundles);

        if (!bundle.mainWorker) {
          throw new Error("DuckDB Web Worker bundle not found");
        }

        const worker = await duckdb.createWorker(bundle.mainWorker);
        const logger = new duckdb.VoidLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);

        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        this.db = db;
        return db;
      } catch (err: unknown) {
        this.initPromise = null;
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to initialize DuckDB WebAssembly engine: ${msg}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Registers an in-memory byte buffer as a virtual file in DuckDB's VFS.
   */
  public async registerFileBuffer(
    fileName: string,
    buffer: Uint8Array
  ): Promise<void> {
    const db = await this.init();
    await db.registerFileBuffer(fileName, buffer);
  }

  /**
   * Removes a file from DuckDB's virtual filesystem to free memory.
   */
  public async dropFile(fileName: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.dropFile(fileName);
    } catch {
      // Ignore if file was already dropped
    }
  }

  /**
   * Reads a virtual file output buffer from DuckDB's VFS.
   */
  public async copyFileToBuffer(fileName: string): Promise<Uint8Array> {
    const db = await this.init();
    return await db.copyFileToBuffer(fileName);
  }

  /**
   * Executes a SQL statement (such as COPY ... TO) without returning tabular results.
   */
  public async execute(sql: string): Promise<void> {
    const db = await this.init();
    const conn = await db.connect();
    try {
      await conn.query(sql);
    } finally {
      await conn.close();
    }
  }

  /**
   * Executes a SQL query and converts the Apache Arrow table into TabularData
   * for the preview table and spreadsheet exporters.
   */
  public async queryTabular(
    sql: string,
    maxRows?: number
  ): Promise<TabularData> {
    const db = await this.init();
    const conn = await db.connect();

    try {
      const table = await conn.query(sql);
      const fields = table.schema.fields.map((f) => f.name);

      const rawRows = table.toArray();
      const rowsToTake = maxRows !== undefined ? rawRows.slice(0, maxRows) : rawRows;

      const rows: Record<string, unknown>[] = rowsToTake.map((row) => {
        const obj: Record<string, unknown> = {};
        for (const field of fields) {
          const val = row[field];
          // Convert BigInt to Number/String to avoid serialization issues
          if (typeof val === "bigint") {
            obj[field] = val <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(val) : val.toString();
          } else {
            obj[field] = val;
          }
        }
        return obj;
      });

      return {
        columns: fields,
        rows,
        totalRows: rawRows.length,
      };
    } finally {
      await conn.close();
    }
  }

  /**
   * Terminates the DuckDB worker and releases memory.
   */
  public async terminate(): Promise<void> {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
      this.initPromise = null;
    }
  }
}

/**
 * Returns the shared DuckDbClient instance.
 */
export function getDuckDbClient(): DuckDbClient {
  return DuckDbClient.getInstance();
}
