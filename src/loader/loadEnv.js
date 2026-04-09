import fs from "fs";
import path from "path";

function loadEnv({ override = false, envFile = ".env" }) {
    
    const filesToTry = [
        path.resolve(process.cwd(), envFile),
        path.resolve(process.cwd(), `${envFile}.local`),
        path.resolve(process.cwd(), `${envFile}.development`),
        path.resolve(process.cwd(), `${envFile}.production`),
    ];

    let filePath = null;
    for (const file of filesToTry) {
        if(fs.existsSync(file)) {
            filePath = file;
            break;
        }
    }

    if (!filePath) {
        throw new Error(`No environment file found. Tried: ${filesToTry.map(f => path.basename(f)).join(", ")}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const lines = fileContent.split("\n");

    const env = {};

    lines.forEach((line, lineNumber) => {
        const trimmedLine = line.trim();

        if (trimmedLine === "" || trimmedLine.startsWith("#")) {
            return;
        }

        const index = trimmedLine.indexOf("=");

        if (index === -1) {
            console.warn(`Invalid line in .env file at line ${lineNumber + 1}: ${trimmedLine}`);
            return;
        }

        const key = trimmedLine.slice(0, index).trim();
        let value = trimmedLine.slice(index + 1).trim();

        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key) {
            if (Object.prototype.hasOwnProperty.call(env, key)) {
                console.warn(`Duplicate key "${key}" found at line ${lineNumber + 1}. Previous value: "${env[key]}", New value: "${value}". ${override ? "Overwriting" : "Keeping first value"}`);
                if (!override) return;
            }
            env[key] = value;

            if (override || !process.env[key]) {
                process.env[key] = value;
            }
        }
    });

    const countKeys = Object.keys(env).length;

    return {
        env,
        countKeys
    };
}

export default loadEnv;