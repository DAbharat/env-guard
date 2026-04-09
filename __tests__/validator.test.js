import validateEnv from "../src/validator/validate.js";

describe("validateEnv", () => {
    test("should validate required string variables", () => {
        const env = { DATABASE_URL: "postgres://localhost" };
        const schema = { DATABASE_URL: { type: "string", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(true);
        expect(result.passed).toBe(1);
        expect(result.missing).toHaveLength(0);
        expect(result.invalid).toHaveLength(0);
    });

    test("should detect missing required variables", () => {
        const env = {};
        const schema = { DATABASE_URL: { type: "string", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(false);
        expect(result.missing).toContain("DATABASE_URL");
    });

    test("should validate number types", () => {
        const env = { PORT: "3000" };
        const schema = { PORT: { type: "number", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(true);
        expect(result.passed).toBe(1);
    });

    test("should reject invalid numbers", () => {
        const env = { PORT: "not-a-number" };
        const schema = { PORT: { type: "number", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(false);
        expect(result.invalid).toHaveLength(1);
        expect(result.invalid[0].key).toBe("PORT");
    });

    test("should validate boolean types", () => {
        const env = { DEBUG: "true" };
        const schema = { DEBUG: { type: "boolean", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(true);
    });

    test("should accept boolean variations", () => {
        const testCases = ["true", "false", "TRUE", "FALSE", true, false];

        testCases.forEach(value => {
            const env = { DEBUG: value };
            const schema = { DEBUG: { type: "boolean", required: true } };
            const result = validateEnv(env, schema);

            expect(result.isValid).toBe(true);
        });
    });

    test("should reject invalid booleans", () => {
        const env = { DEBUG: "maybe" };
        const schema = { DEBUG: { type: "boolean", required: true } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(false);
        expect(result.invalid).toHaveLength(1);
    });

    test("should allow optional variables", () => {
        const env = {};
        const schema = { DEBUG: { type: "boolean", required: false } };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(true);
        expect(result.passed).toBe(1);
    });

    test("should handle mixed valid and invalid vars", () => {
        const env = {
            DATABASE_URL: "postgres://localhost",
            PORT: "invalid",
            DEBUG: "true"
        };
        const schema = {
            DATABASE_URL: { type: "string", required: true },
            PORT: { type: "number", required: true },
            DEBUG: { type: "boolean", required: true }
        };
        const result = validateEnv(env, schema);

        expect(result.isValid).toBe(false);
        expect(result.passed).toBe(2);
        expect(result.invalid).toHaveLength(1);
    });

    test("should throw on invalid env input", () => {
        const schema = { KEY: { type: "string", required: true } };

        expect(() => validateEnv(null, schema)).toThrow();
        expect(() => validateEnv(undefined, schema)).toThrow();
    });

    test("should throw on invalid schema input", () => {
        const env = { KEY: "value" };

        expect(() => validateEnv(env, null)).toThrow();
        expect(() => validateEnv(env, undefined)).toThrow();
    });
});
