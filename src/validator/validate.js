function validateEnv(env, schema, { debug = false } = {}) {

    if (!env || typeof env !== "object") {
        throw new Error("[env-guard]: Invalid environment object provided for validation.")
    }
    if (!schema || typeof schema !== "object") {
        throw new Error("[env-guard]: Invalid schema object provided for validation.")
    }

    let result = {
        missing: [],
        invalid: []
    }

    if (debug) console.log(`[env-guard]: Starting validation...`)
    for (const key of Object.keys(schema)) {

        let rule = schema[key]
        let value = env[key]

        if (rule.required && (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))) {
            result.missing.push(key)
            continue
        } else if (value === undefined && !rule.required) {
            continue
        }

        if (rule.type) {
            switch (rule.type) {
                case "string":
                    if (typeof value !== "string") {
                        result.invalid.push({
                            key: key,
                            expected: "string",
                            received: value,
                            actualType: typeof value,
                            reason: `Expected string, received ${typeof value}` 
                        })
                    }
                break;

                case "number":
                    if (isNaN(Number(value))) {
                        result.invalid.push({
                            key: key,
                            expected: "number",
                            received: value,
                            actualType: typeof value,
                            reason: `Expected number, received value that cannot be converted to a number` 
                        })
                    }
                break;

                case "boolean":
                    const isValidBoolean = typeof value === "boolean" || (typeof value === "string" && ["true", "false"].includes(value.toLowerCase().trim()));
                    if (!isValidBoolean) {
                        result.invalid.push({
                            key: key,
                            expected: "boolean",
                            received: value,
                            actualType: typeof value,
                            reason: `Expected boolean, received ${typeof value}`
                        })
                    }
                break;
            }
        }
    }
    if (debug) console.log(`[env-guard]: Validation complete. Missing keys: ${result.missing.length}, Invalid keys: ${result.invalid.length}`)

    let total = Object.keys(schema).length
    let missing = result.missing.length
    let invalid = result.invalid.length
    let passed = total - missing - invalid

    return {
        missing: missing,
        invalid: invalid,
        passed: passed,
        isValid: missing === 0 && invalid === 0
    }
}

export default validateEnv;

