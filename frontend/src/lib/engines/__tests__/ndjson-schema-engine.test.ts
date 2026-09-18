import { describe, it, expect } from "vitest";
import {
  JsonToNdjsonEngine,
  jsonToNdjsonEngine,
  JsonToSchemaEngine,
  jsonToSchemaEngine,
} from "../ndjson-schema-engine";

describe("JsonToNdjsonEngine", () => {
  it("exports a singleton instance", () => {
    expect(jsonToNdjsonEngine).toBeInstanceOf(JsonToNdjsonEngine);
  });

  it("parsePreview handles top-level array of objects", async () => {
    const data = [
      { id: 1, name: "Alice", active: true },
      { id: 2, name: "Bob", active: false },
    ];
    const file = new File([JSON.stringify(data)], "users.json", {
      type: "application/json",
    });

    const preview = await jsonToNdjsonEngine.parsePreview(file);
    expect(preview.columns).toEqual(["id", "name", "active"]);
    expect(preview.totalRows).toBe(2);
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0]).toEqual({ id: 1, name: "Alice", active: true });
  });

  it("parsePreview handles top-level object containing array", async () => {
    const data = {
      status: "success",
      data: [
        { id: 101, product: "Widget A" },
        { id: 102, product: "Widget B" },
      ],
    };
    const file = new File([JSON.stringify(data)], "products.json", {
      type: "application/json",
    });

    const preview = await jsonToNdjsonEngine.parsePreview(file);
    expect(preview.columns).toEqual(["id", "product"]);
    expect(preview.totalRows).toBe(2);
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[1]).toEqual({ id: 102, product: "Widget B" });
  });

  it("parsePreview respects maxRows", async () => {
    const data = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
    const file = new File([JSON.stringify(data)], "many.json", {
      type: "application/json",
    });

    const preview = await jsonToNdjsonEngine.parsePreview(file, 5);
    expect(preview.totalRows).toBe(20);
    expect(preview.rows).toHaveLength(5);
  });

  it("parsePreview returns empty on empty file", async () => {
    const file = new File([""], "empty.json", { type: "application/json" });
    const preview = await jsonToNdjsonEngine.parsePreview(file);
    expect(preview.columns).toEqual([]);
    expect(preview.rows).toEqual([]);
    expect(preview.totalRows).toBe(0);
  });

  it("parsePreview throws on invalid JSON", async () => {
    const file = new File(["{ invalid json"], "bad.json", {
      type: "application/json",
    });
    await expect(jsonToNdjsonEngine.parsePreview(file)).rejects.toThrow(
      /Invalid JSON format/i
    );
  });

  it("convert produces valid newline-separated JSON records (application/x-ndjson)", async () => {
    const data = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    const file = new File([JSON.stringify(data)], "users.json", {
      type: "application/json",
    });

    const output = await jsonToNdjsonEngine.convert(file);
    expect(output.filename).toBe("users.ndjson");
    expect(output.mimeType).toBe("application/x-ndjson");

    const content = await output.blob.text();
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toEqual({ id: 1, name: "Alice" });
    expect(JSON.parse(lines[1])).toEqual({ id: 2, name: "Bob" });
  });

  it("convert with flattenNested flattens nested object keys into dot-notation paths", async () => {
    const data = [
      {
        id: 1,
        user: { name: "Alice", address: { city: "Wonderland" } },
        tags: ["admin", "dev"],
      },
    ];
    const file = new File([JSON.stringify(data)], "nested.json", {
      type: "application/json",
    });

    const output = await jsonToNdjsonEngine.convert(file, {
      flattenNested: true,
    });
    const content = await output.blob.text();
    const parsed = JSON.parse(content.trim());
    expect(parsed).toEqual({
      id: 1,
      "user.name": "Alice",
      "user.address.city": "Wonderland",
      tags: "admin, dev",
    });
  });

  it("convert without flattenNested preserves nested objects", async () => {
    const data = [
      {
        id: 1,
        user: { name: "Alice" },
      },
    ];
    const file = new File([JSON.stringify(data)], "nested.json", {
      type: "application/json",
    });

    const output = await jsonToNdjsonEngine.convert(file, {
      flattenNested: false,
    });
    const content = await output.blob.text();
    const parsed = JSON.parse(content.trim());
    expect(parsed).toEqual({
      id: 1,
      user: { name: "Alice" },
    });
  });

  it("convert throws error on empty file", async () => {
    const file = new File([""], "empty.json", { type: "application/json" });
    await expect(jsonToNdjsonEngine.convert(file)).rejects.toThrow(
      /JSON file is empty/i
    );
  });
});

describe("JsonToSchemaEngine", () => {
  it("exports a singleton instance", () => {
    expect(jsonToSchemaEngine).toBeInstanceOf(JsonToSchemaEngine);
  });

  it("parsePreview returns schema tabular columns and rows", async () => {
    const data = [
      {
        id: 1,
        score: 98.6,
        name: "Test",
        active: true,
        tags: ["a", "b"],
        profile: { bio: "hello" },
        deletedAt: null,
      },
    ];
    const file = new File([JSON.stringify(data)], "schema_test.json", {
      type: "application/json",
    });

    const preview = await jsonToSchemaEngine.parsePreview(file);
    expect(preview.columns).toEqual([
      "Property",
      "Type",
      "Required",
      "Sample Value",
    ]);
    expect(preview.totalRows).toBe(7);

    const propMap = new Map(
      preview.rows.map((r) => [r["Property"], r])
    );
    expect(propMap.get("id")?.["Type"]).toBe("integer");
    expect(propMap.get("score")?.["Type"]).toBe("number");
    expect(propMap.get("name")?.["Type"]).toBe("string");
    expect(propMap.get("active")?.["Type"]).toBe("boolean");
    expect(propMap.get("tags")?.["Type"]).toBe("array");
    expect(propMap.get("profile")?.["Type"]).toBe("object");
    expect(propMap.get("deletedAt")?.["Type"]).toBe("null");

    expect(propMap.get("id")?.["Required"]).toBe("Yes");
  });

  it("parsePreview marks property not required if missing in some rows", async () => {
    const data = [
      { id: 1, name: "Alice" },
      { id: 2 }, // name is missing
    ];
    const file = new File([JSON.stringify(data)], "optional.json", {
      type: "application/json",
    });

    const preview = await jsonToSchemaEngine.parsePreview(file);
    const propMap = new Map(
      preview.rows.map((r) => [r["Property"], r])
    );
    expect(propMap.get("id")?.["Required"]).toBe("Yes");
    expect(propMap.get("name")?.["Required"]).toBe("No");
  });

  it("parsePreview returns empty tabular data on empty file", async () => {
    const file = new File([""], "empty.json", { type: "application/json" });
    const preview = await jsonToSchemaEngine.parsePreview(file);
    expect(preview.columns).toEqual([]);
    expect(preview.rows).toEqual([]);
    expect(preview.totalRows).toBe(0);
  });

  it("convert produces valid Draft-07 JSON Schema", async () => {
    const data = [
      {
        id: 101,
        title: "Item 1",
        price: 19.99,
        available: true,
        tags: ["shop", "new"],
        meta: { views: 50 },
      },
      {
        id: 102,
        title: "Item 2",
        price: 29.99,
        available: false,
        tags: [],
        meta: { views: 10 },
      },
    ];
    const file = new File([JSON.stringify(data)], "products.json", {
      type: "application/json",
    });

    const output = await jsonToSchemaEngine.convert(file);
    expect(output.filename).toBe("products.schema.json");
    expect(output.mimeType).toBe("application/schema+json");

    const text = await output.blob.text();
    const schema = JSON.parse(text);

    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.title).toBe("products");
    expect(schema.type).toBe("object");
    expect(schema.properties).toBeDefined();
    expect(schema.properties.id.type).toBe("integer");
    expect(schema.properties.title.type).toBe("string");
    expect(schema.properties.price.type).toBe("number");
    expect(schema.properties.available.type).toBe("boolean");
    expect(schema.properties.tags.type).toBe("array");
    expect(schema.properties.meta.type).toBe("object");

    // All properties were present in both items
    expect(schema.required).toContain("id");
    expect(schema.required).toContain("title");
    expect(schema.required).toContain("price");
  });

  it("convert supports single object input directly", async () => {
    const data = {
      username: "john_doe",
      age: 30,
      active: true,
    };
    const file = new File([JSON.stringify(data)], "user.json", {
      type: "application/json",
    });

    const output = await jsonToSchemaEngine.convert(file);
    const schema = JSON.parse(await output.blob.text());

    expect(schema.title).toBe("user");
    expect(schema.properties.username.type).toBe("string");
    expect(schema.properties.age.type).toBe("integer");
    expect(schema.properties.active.type).toBe("boolean");
    expect(schema.required).toEqual(
      expect.arrayContaining(["username", "age", "active"])
    );
  });

  it("convert throws error on empty file", async () => {
    const file = new File([""], "empty.json", { type: "application/json" });
    await expect(jsonToSchemaEngine.convert(file)).rejects.toThrow(
      /JSON file is empty/i
    );
  });
});

describe("getConverterEngine registry integration", () => {
  it("retrieves json-to-ndjson engine", async () => {
    const { getConverterEngine } = await import("../index");
    const engine = getConverterEngine("json-to-ndjson");
    expect(engine).toBe(jsonToNdjsonEngine);
  });

  it("retrieves json-to-schema engine", async () => {
    const { getConverterEngine } = await import("../index");
    const engine = getConverterEngine("json-to-schema");
    expect(engine).toBe(jsonToSchemaEngine);
  });
});
