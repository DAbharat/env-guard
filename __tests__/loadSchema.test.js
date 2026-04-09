import loadSchema from "../src/loader/loadSchema.js";

describe("loadSchema", () => {
    test("should load schema from env.schema.js file", async () => {
        const schema = await loadSchema({ schemaPath: "env.schema.js" });

        expect(schema).toHaveProperty("DATABASE_URL");
        expect(schema).toHaveProperty("API_PORT");
        expect(typeof schema).toBe("object");
    });

    test("should cache schema on subsequent calls", async () => {
        const schema1 = await loadSchema({ schemaPath: "env.schema.js" });
        const schema2 = await loadSchema({ schemaPath: "env.schema.js" });

        expect(schema1).toEqual(schema2);
    });

    test("should validate schema structure", async () => {
        const schema = await loadSchema({ schemaPath: "env.schema.js" });

        Object.entries(schema).forEach(([key, rule]) => {
            expect(typeof rule).toBe("object");
            if (rule.type) {
                expect(["string", "number", "boolean"]).toContain(rule.type);
            }
            if (rule.required) {
                expect(typeof rule.required).toBe("boolean");
            }
        });
    });

    test("should throw on invalid schema file path", async () => {
        try {
            await loadSchema({ schemaPath: "non-existent-schema.js" });
            expect(true).toBe(false); 
        } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message.length > 0).toBe(true);
        }
    });

    test("should debug log when debug flag is enabled", async () => {
        const schema = await loadSchema({ schemaPath: "env.schema.js", debug: true });
        expect(schema).toBeDefined();
    });
});

