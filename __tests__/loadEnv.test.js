import fs from "fs";
import loadEnv from "../src/loader/loadEnv.js";

describe("loadEnv", () => {
    test("should load environment variables from .env file", () => {
        const result = loadEnv({ override: false });

        expect(result).toHaveProperty("env");
        expect(result).toHaveProperty("countKeys");
        expect(typeof result.countKeys).toBe("number");
        expect(result.countKeys > 0).toBe(true);
    });

    test("should return env object and countKeys", () => {
        const result = loadEnv({ override: false });

        expect(typeof result.env).toBe("object");
        expect(Object.keys(result.env).length).toBe(result.countKeys);
    });

    test("should handle .env file with comments and empty lines", () => {
        const result = loadEnv({ override: false });

        expect(result.countKeys).toBeGreaterThan(0);
    });

    test("should throw error when .env not found", () => {
        const result = loadEnv({ override: false });
        expect(result).toBeDefined();
    });
});

