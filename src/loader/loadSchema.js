import fs from "fs";
import path from "path";
import url from "url";

let cachedSchema = null;

async function loadSchema({ schemaPath = "env.schema.js", debug = false } = {}) {

    if (cachedSchema) {
        if (debug) console.log("[env-guard]: Schema loaded from cache");
        return cachedSchema;
    }

    const filePath = path.resolve(process.cwd(), schemaPath);

    if (!fs.existsSync(filePath)) {
        throw new Error(`${schemaPath} file not found in project root`);
    }

    if (debug) {
        console.log(`[env-guard]: Loading schema from: ${filePath}`);
    }

    const fileURL = url.pathToFileURL(filePath);

    let importedSchemaModule;
    try {
        importedSchemaModule = await import(fileURL);
        if (debug) console.log(`[env-guard]: Schema imported successfully. Keys: ${Object.keys(importedSchemaModule.default || importedSchemaModule).join(", ")}`);
    } catch (error) {
        if (error.code === "ERR_MODULE_NOT_FOUND") {
            throw new Error(`${schemaPath} file not found in project root`);
        } else if (error.code === "ERR_UNSUPPORTED_DIR_IMPORT") {
            throw new Error(`Failed to import ${schemaPath}. This error can occur if the file is empty or if the path points to a directory instead of a file. Please ensure that ${schemaPath} exists and contains valid JavaScript code.`);
        } else if (error instanceof SyntaxError) {
            throw new Error(`Syntax error in ${schemaPath}: ${error.message}`);
        } else {
            throw new Error(`Failed to import ${schemaPath}: ${error.message}`);
        }
    }

    if (importedSchemaModule.default) {
        cachedSchema = importedSchemaModule.default;
    } else {
        const keys = Object.keys(importedSchemaModule);

        if (keys.length === 1) {
            cachedSchema = importedSchemaModule[keys[0]];
        } else {
            throw new Error(`Invalid schema export in ${schemaPath}. Schema must export a default object (export default {...}) or a single named export.`);
        }
    }

    if (typeof cachedSchema !== "object" || cachedSchema === null) {
        throw new Error("Schema must export a default object (export default {...})");
    } else if (Object.keys(cachedSchema).length === 0) {
        console.warn(`[env-guard]: Warning: ${schemaPath} does not export any keys. No validation will be performed.`);
    }

    if (debug) console.log("[env-guard]: Validating schema keys...");
    const ALLOWED_SCHEMA_KEYS = ["type", "required"];
    Object.keys(cachedSchema).forEach(key => {
        const rule = cachedSchema[key];

        if (typeof rule !== "object" || rule === null) {
            throw new Error(`[env-guard]: Invalid schema definition for key "${key}". Each key must be an object with validation rules.`);
        }

        if (rule.type && !["string", "number", "boolean"].includes(rule.type)) {
            throw new Error(`[env-guard]: Invalid type for key "${key}". Supported types are "string", "number", and "boolean".`);
        }

        if (rule.required !== undefined && typeof rule.required !== "boolean") {
            throw new Error(`[env-guard]: Invalid required value for key "${key}". The "required" property must be a boolean (true or false).`);
        }

        Object.keys(rule).forEach(prop => {
            if (!ALLOWED_SCHEMA_KEYS.includes(prop)) {
                console.warn(`[env-guard]: Unknown property "${prop}" in schema for key "${key}". Allowed properties: ${ALLOWED_SCHEMA_KEYS.join(", ")}`);
            }
        });
    });

    if (debug) console.log("[env-guard]: Schema validation complete. Cached for future use.");

    return cachedSchema;
}

export default loadSchema;