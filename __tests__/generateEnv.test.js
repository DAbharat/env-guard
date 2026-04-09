import fs from "fs";
import generateEnv from "../src/generator/generateEnv.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("generateEnv", () => {
    const testOutputPath = join(__dirname, "test-env.example");

    afterEach(() => {
        if (fs.existsSync(testOutputPath)) {
            fs.unlinkSync(testOutputPath);
        }
    });

    test("should generate .env.example file from schema", () => {
        const schema = {
            DATABASE_URL: { type: "string", required: true },
            API_PORT: { type: "number", required: true },
            DEBUG: { type: "boolean", required: false }
        };

        const result = generateEnv(schema, testOutputPath);

        expect(result).toBe(true);
        expect(fs.existsSync(testOutputPath)).toBe(true);
    });

    test("should include all schema keys in generated file", () => {
        const schema = {
            DATABASE_URL: { type: "string", required: true },
            API_PORT: { type: "number", required: true }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("DATABASE_URL");
        expect(content).toContain("API_PORT");
    });

    test("should mark required variables in comments", () => {
        const schema = {
            REQUIRED_VAR: { type: "string", required: true },
            OPTIONAL_VAR: { type: "string", required: false }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("REQUIRED_VAR (required)");
        expect(content).toContain("OPTIONAL_VAR (optional)");
    });

    test("should generate string placeholders", () => {
        const schema = {
            NAME: { type: "string", required: true }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("your_value_here");
    });

    test("should generate number placeholders", () => {
        const schema = {
            PORT: { type: "number", required: true }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("PORT=3000");
    });

    test("should generate boolean placeholders", () => {
        const schema = {
            DEBUG: { type: "boolean", required: true }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("DEBUG=true");
    });

    test("should not overwrite existing file", () => {
        const schema = { KEY: { type: "string", required: true } };

        generateEnv(schema, testOutputPath);
        const firstContent = fs.readFileSync(testOutputPath, "utf-8");

        const result = generateEnv(schema, testOutputPath);

        expect(result).toBe(false);
        const secondContent = fs.readFileSync(testOutputPath, "utf-8");
        
        expect(firstContent).toBe(secondContent);
    });

    test("should handle empty schema", () => {
        const schema = {};

        const result = generateEnv(schema, testOutputPath);

        expect(result).toBe(true);
        expect(fs.existsSync(testOutputPath)).toBe(true);
        
        const content = fs.readFileSync(testOutputPath, "utf-8");
        expect(content.trim()).toBe("");
    });

    test("should handle schema with no type defined", () => {
        const schema = {
            CUSTOM_VAR: { required: true }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        expect(content).toContain("CUSTOM_VAR=your_value_here");
    });

    test("should generate valid .env.example format", () => {
        const schema = {
            DATABASE_URL: { type: "string", required: true },
            PORT: { type: "number", required: false }
        };

        generateEnv(schema, testOutputPath);
        const content = fs.readFileSync(testOutputPath, "utf-8");

        const lines = content.split("\n").filter(line => !line.startsWith("#") && line.trim());
        
        lines.forEach(line => {
            expect(line).toMatch(/^[A-Z_]+=.+$/);
        });
    });
});