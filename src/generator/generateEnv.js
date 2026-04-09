import fs from "fs";

function generatePlaceholder(rule) {
    switch (rule.type) {
    case "string":
        return "your_value_here";
    case "number":
        return "3000";
    case "boolean":
        return "true";
    default:
        return "your_value_here";
    }
}

function generateEnv(schema, outputPath = ".env.example") {
    const lines = [];

    Object.entries(schema).forEach(([key, rule]) => {
        const placeholder = generatePlaceholder(rule);
        const required = rule.required ? " (required)" : " (optional)";

        lines.push(`# ${key}${required}`);
        lines.push(`${key}=${placeholder}`);
        lines.push("");
    });

    const content = lines.join("\n");

    if(fs.existsSync(outputPath)) {
        console.warn(`[env-guard]: Warning: ${outputPath} already exists. Skipping generation to avoid overwriting.`);
        return false;
    }

    fs.writeFileSync(outputPath, content, "utf-8");
    console.log(`[env-guard]: Generated ${outputPath} based on schema. Please review and update the values before use.`);
    return true;
}

export default generateEnv;