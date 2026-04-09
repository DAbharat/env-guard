# env-guard

A lightweight environment variable validation tool for Node.js applications. Validate environment variables against a schema before your application starts.

## Features

- ✅ **Schema-based validation** - Define required variables and their types
- ✅ **Fast and lightweight** - Minimal dependencies (only dotenv)
- ✅ **CLI tool** - Built-in command-line interface
- ✅ **Multiple .env file support** - Supports `.env`, `.env.local`, `.env.development`, `.env.production`
- ✅ **Type checking** - Validates string, number, and boolean types
- ✅ **Production ready** - Proper error handling and exit codes
- ✅ **Fully tested** - Jest test suite with 20+ tests

## Installation

```bash
npm install env-guard
```

Or as a dev dependency:

```bash
npm install --save-dev env-guard
```

## Quick Start

### 1. Create a schema file (`env.schema.js`)

```javascript
export default {
    DATABASE_URL: { 
        type: "string", 
        required: true 
    },
    API_PORT: { 
        type: "number", 
        required: true 
    },
    DEBUG: { 
        type: "boolean", 
        required: false 
    }
};
```

### 2. Create a `.env` file

```env
DATABASE_URL=postgres://localhost:5432/mydb
API_PORT=3000
DEBUG=true
```

### 3. Run validation

```bash
env-guard
```

**Output:**
```
[env-guard]: Loaded 3 variables. Summary: 3 passed, 0 missing, 0 invalid.
```

## CLI Commands

```bash
# Basic validation
env-guard

# Show help
env-guard --help
# or
env-guard -h

# Show version
env-guard --version
# or
env-guard -v

# Enable debug logging
env-guard --debug
# or
env-guard -d

# Minimal output (errors only)
env-guard --quiet
# or
env-guard -q

# Specify custom schema file
env-guard --schema ./config/schema.js

# Override existing environment variables from .env
env-guard --override
# or
env-guard -o
```

## Schema Definition

Each variable in the schema object should define:

- `type` (optional) - Data type: `"string"`, `"number"`, or `"boolean"`
- `required` (optional, default: false) - Whether the variable must be present

```javascript
export default {
    // Required string variable
    DATABASE_URL: { 
        type: "string", 
        required: true 
    },

    // Required number variable
    API_PORT: { 
        type: "number", 
        required: true 
    },

    // Optional boolean variable
    DEBUG: { 
        type: "boolean", 
        required: false 
    },

    // Required variable (any type)
    APP_NAME: { 
        required: true 
    }
};
```

## Environment File Fallback

env-guard checks for environment files in this order:

1. `.env` (or custom file specified with `--schema`)
2. `.env.local` (for local overrides)
3. `.env.development` (for development-specific variables)
4. `.env.production` (for production-specific variables)

The first file found will be used. If none exist, validation fails.

## Type Validation

### String Type
```javascript
DATABASE_URL: { type: "string", required: true }
```
Validates that the value is a string. Empty strings are rejected for required variables.

### Number Type
```javascript
API_PORT: { type: "number", required: true }
```
Validates that the value can be converted to a number. Strings like `"3000"` are accepted.

### Boolean Type
```javascript
DEBUG: { type: "boolean", required: true }
```
Accepts: `true`, `false`, `"true"`, `"false"`, `"TRUE"`, `"FALSE"` (case-insensitive)

## Validation Results

The validator provides detailed feedback when validation fails.

**Missing variables:**
```
[env-guard]: Missing environment variables: SECRET_KEY, API_TOKEN
  - SECRET_KEY is missing
  - API_TOKEN is missing
```

**Invalid types:**
```
[env-guard]: Invalid environment variables:
  - PORT is invalid. Expected type: number, Received value: abc (type: string). 
    Reason: Expected number, received value that cannot be converted to a number
```

## Exit Codes

- `0` - Validation successful, all variables are valid
- `1` - Validation failed, missing or invalid variables detected

## Integration with npm Scripts

Add env-guard to your npm scripts to validate before starting your application:

```json
{
  "scripts": {
    "start": "env-guard && node index.js",
    "dev": "env-guard --debug && node --watch index.js",
    "validate": "env-guard"
  }
}
```

Then run:
```bash
npm start
```

The application will only start if all environment variables pass validation.

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

Generate coverage report:

```bash
npm test:coverage
```

The project includes 20+ tests covering:
- ✅ String, number, and boolean type validation
- ✅ Required and optional variables
- ✅ Missing variable detection
- ✅ Invalid type handling
- ✅ Environment file loading and fallbacks
- ✅ Edge cases and error conditions

## Development

### Setup

```bash
npm install
```

### Linting

Check code quality:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

### Running the CLI

```bash
node src/cli/index.js
```

## Example: Production Setup

**env.schema.js**
```javascript
export default {
    DATABASE_URL: { type: "string", required: true },
    DATABASE_PASSWORD: { type: "string", required: true },
    API_PORT: { type: "number", required: true },
    NODE_ENV: { type: "string", required: true }
};
```

**.env**
```env
DATABASE_URL=postgres://localhost:5432/production_db
DATABASE_PASSWORD=secure_password_here
API_PORT=5000
NODE_ENV=production
```

**package.json**
```json
{
  "scripts": {
    "start": "env-guard && node src/index.js"
  }
}
```

## Error Messages

All errors are prefixed with `[env-guard]:` for easy identification in logs.

Common errors:

```
[env-guard]: Error - .env file not found in project root

[env-guard]: Error - env.schema.js file not found at: /path/to/env.schema.js

[env-guard]: Missing environment variables: DATABASE_URL

[env-guard]: Invalid environment variables: API_PORT
```

## License

ISC

## Support & Contributing

For issues, feature requests, or questions:
- GitHub: https://github.com/DAbharat/env-guard
- Issues: https://github.com/DAbharat/env-guard/issues

