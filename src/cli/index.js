#!/usr/bin/env node

import validateEnv from "../validator/validate.js";
import loadEnv from "../loader/loadEnv.js";
import loadSchema from "../loader/loadSchema.js";
import fs, { readFileSync } from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import generateEnv from "../generator/generateEnv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
    readFileSync(join(__dirname, "../../package.json"), "utf8")
);

function parseArgs() {
    const args = process.argv.slice(2);

    return {
        debug: args.includes("--debug") || args.includes("-d"),
        quiet: args.includes("--quiet") || args.includes("-q"),
        help: args.includes("--help") || args.includes("-h"),
        version: args.includes("--version") || args.includes("-v"),
        override: args.includes("--override") || args.includes("-o"),
        generate: args.includes("--generate") || args.includes("-g"),
        schemaPath: (() => {
            const index = args.indexOf("--schema");
            return index !== -1 && args[index + 1] ? args[index + 1] : "env.schema.js";
        })()
    };
}

function withTimeout(promise, ms = 3000) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Schema loading timed out")), ms)
        )
    ]);
}

async function main() {
    const { debug, quiet, help, version, override, generate, schemaPath } = parseArgs();

    if (help) {
        console.log(`
env-guard v${pkg.version}

Usage:
env-guard [options]

Options:
  --schema <path>    Specify schema file (default: env.schema.js)
  -d, --debug       Enable debug logs
  -q, --quiet       Minimal output
  -o, --override    Override existing env variables
  -h, --help        Show help
  -v, --version     Show version
  -g, --generate    Generate schema file
`);
        process.exit(0);
    }

    if (version) {
        console.log(`env-guard version: ${pkg.version}`);
        process.exit(0);
    }

    if(generate) {
        const schema = await withTimeout(loadSchema({ schemaPath, debug }));
        const generated = generateEnv( schema, ".env.example" );
        if(generated) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    }

    let result;
    let countKeys = 0;

    try {
        const env = loadEnv({ override });
        countKeys = env.countKeys;
        const envData = env.env;
        if(debug) {
            console.log(`[env-guard]: Loaded environment variables from .env file. Total keys: ${countKeys}`);
        }
        const completeEnv = { ...process.env, ...envData };

        const resolvedSchemaPath = path.resolve(process.cwd(), schemaPath);
        if(!fs.existsSync(resolvedSchemaPath)) {
            throw new Error(`[env-guard]: Schema file not found at: ${resolvedSchemaPath}`);
        }
        const schema = await withTimeout(loadSchema({ schemaPath, debug }));

        result = validateEnv(completeEnv, schema, { debug });
    } catch (error) {
        console.error(`[env-guard]: ${error.message}`);
        process.exit(1);
    }

    if (!quiet && result.missing.length > 0) {
        console.error(`\n[env-guard]: Missing environment variables: ${result.missing.join(", ")}`);

        result.missing.forEach(key => {
            console.error(`  - ${key} is missing`);
        });
    }

    if (!quiet && result.invalid.length > 0) {
        console.error("\n[env-guard]: Invalid environment variables:");

        result.invalid.forEach(item => {
            console.error(`  - ${item.key} is invalid. Expected type: ${item.expected}, Received value: ${item.received} (type: ${item.actualType}). Reason: ${item.reason}`);
        });
    }

    if (!quiet) {
        console.log(`\n[env-guard]: Loaded ${countKeys} variables. Summary: ${result.passed} passed, ${result.missing.length} missing, ${result.invalid.length} invalid.`);
    }

    if (result.isValid) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

main();