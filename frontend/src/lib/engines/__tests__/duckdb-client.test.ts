import { describe, it, expect, vi, beforeEach } from "vitest";
import { DuckDbClient, getDuckDbClient } from "../duckdb-client";

describe("DuckDbClient", () => {
  beforeEach(() => {
    DuckDbClient.resetInstance();
    vi.restoreAllMocks();
  });

  it("maintains a singleton instance", () => {
    const client1 = DuckDbClient.getInstance();
    const client2 = DuckDbClient.getInstance();
    const client3 = getDuckDbClient();

    expect(client1).toBe(client2);
    expect(client2).toBe(client3);
  });

  it("resets instance on resetInstance()", () => {
    const client1 = DuckDbClient.getInstance();
    DuckDbClient.resetInstance();
    const client2 = DuckDbClient.getInstance();

    expect(client1).not.toBe(client2);
  });

  it("queryTabular converts Arrow table to TabularData and converts BigInt safely", async () => {
    const mockTable = {
      schema: {
        fields: [{ name: "id" }, { name: "name" }, { name: "big_val" }],
      },
      toArray: () => [
        { id: 1, name: "Alpha", big_val: BigInt(42) },
        { id: 2, name: "Beta", big_val: BigInt(9007199254740991) },
      ],
    };

    const mockConn = {
      query: vi.fn().mockResolvedValue(mockTable),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const mockDb = {
      connect: vi.fn().mockResolvedValue(mockConn),
    };

    const client = DuckDbClient.getInstance();
    // @ts-expect-error setting mock db
    client["db"] = mockDb;

    const result = await client.queryTabular("SELECT * FROM test", 1);

    expect(result.columns).toEqual(["id", "name", "big_val"]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({ id: 1, name: "Alpha", big_val: 42 });
    expect(result.totalRows).toBe(2);
    expect(mockConn.close).toHaveBeenCalledTimes(1);
  });

  it("execute runs query without returning rows and closes connection", async () => {
    const mockConn = {
      query: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const mockDb = {
      connect: vi.fn().mockResolvedValue(mockConn),
    };

    const client = DuckDbClient.getInstance();
    // @ts-expect-error setting mock db
    client["db"] = mockDb;

    await client.execute("COPY test TO 'out.csv'");
    expect(mockConn.query).toHaveBeenCalledWith("COPY test TO 'out.csv'");
    expect(mockConn.close).toHaveBeenCalledTimes(1);
  });

  it("registerFileBuffer and copyFileToBuffer delegate to db instance", async () => {
    const mockDb = {
      registerFileBuffer: vi.fn().mockResolvedValue(undefined),
      copyFileToBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      dropFile: vi.fn().mockResolvedValue(undefined),
    };

    const client = DuckDbClient.getInstance();
    // @ts-expect-error setting mock db
    client["db"] = mockDb;

    const buffer = new Uint8Array([10, 20]);
    await client.registerFileBuffer("data.parquet", buffer);
    expect(mockDb.registerFileBuffer).toHaveBeenCalledWith("data.parquet", buffer);

    const out = await client.copyFileToBuffer("out.parquet");
    expect(out).toEqual(new Uint8Array([1, 2, 3]));

    await client.dropFile("data.parquet");
    expect(mockDb.dropFile).toHaveBeenCalledWith("data.parquet");
  });

  it("dropFile does not throw if db is uninitialized", async () => {
    const client = DuckDbClient.getInstance();
    await expect(client.dropFile("non_existent.parquet")).resolves.not.toThrow();
  });

  it("terminate terminates the db and clears reference", async () => {
    const mockDb = {
      terminate: vi.fn().mockResolvedValue(undefined),
    };

    const client = DuckDbClient.getInstance();
    // @ts-expect-error setting mock db
    client["db"] = mockDb;

    await client.terminate();
    expect(mockDb.terminate).toHaveBeenCalledTimes(1);
    expect(client["db"]).toBeNull();
  });
});
