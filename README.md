# env-guard

[![npm version](https://img.shields.io/npm/v/%40dabharat%2Fenv-guard.svg)](https://www.npmjs.com/package/@dabharat/env-guard)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/node/v/%40dabharat%2Fenv-guard.svg)](https://nodejs.org/)

A lightweight, production-ready environment variable validation tool for Node.js applications. Validate environment variables against a schema before your application starts, generate `.env.example` templates, and ensure type safety.

## Features

- ✅ **Schema-based validation** - Define required variables and their types
- ✅ **Type checking** - Validates string, number, and boolean types
- ✅ **Generate templates** - Auto-generate `.env.example` from schema
- ✅ **Multiple .env file support** - Supports `.env`, `.env.local`, `.env.development`, `.env.production`
- ✅ **CLI tool** - Built-in command-line interface with 7+ commands
- ✅ **Minimal dependencies** - Only depends on `dotenv`
- ✅ **Production ready** - Proper error handling and exit codes
- ✅ **Fully tested** - Jest test suite with 30+ tests and 100% ESLint passing

## Installation

### From npm

```bash
npm install env-guard
```

Or as a dev dependency:

```bash
npm install --save-dev env-guard
```

### Run CLI

Global:
```bash
env-guard --help
```

Or via npx:
```bash
npx env-guard --help
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

### 2. Generate `.env.example` template

```bash
env-guard --generate
```

This creates `.env.example` based on your schema:

```env
# DATABASE_URL (required)
DATABASE_URL=your_value_here

# API_PORT (required)
API_PORT=3000

# DEBUG (optional)
DEBUG=true
```

### 3. Copy and fill in the template

```bash
cp .env.example .env
# Edit .env with your actual values
nano .env
```

### 4. Validate on startup

```bash
env-guard
```

**Output:**
```
[env-guard]: Loaded 3 variables. Summary: 3 passed, 0 missing, 0 invalid.
```

## CLI Commands

```bash
# Validate environment variables
env-guard

# Generate .env.example from schema (NEW!)
env-guard --generate
# or
env-guard -g

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
2. `.env.local` (for local overrides, typically gitignored)
3. `.env.development` (for development-specific variables)
4. `.env.production` (for production-specific variables)

The first file found will be used. If none exist, validation fails with an error.

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

## Validation Output

### Success
```
[env-guard]: Loaded 3 variables. Summary: 3 passed, 0 missing, 0 invalid.
```

### Missing variables
```
[env-guard]: Missing environment variables: SECRET_KEY, API_TOKEN
  - SECRET_KEY is missing
  - API_TOKEN is missing
```

### Invalid types
```
[env-guard]: Invalid environment variables:
  - PORT is invalid. Expected type: number, Received value: abc (type: string). 
    Reason: Expected number, received value that cannot be converted to a number
```

## Exit Codes

- `0` - Validation successful or generation successful
- `1` - Validation failed (missing/invalid variables) or generation failed

## Integration with npm Scripts

Add env-guard to your npm scripts to validate before starting your application:

```json
{
  "scripts": {
    "start": "env-guard && node src/index.js",
    "dev": "env-guard --debug && node --watch src/index.js",
    "validate": "env-guard",
    "setup": "env-guard --generate && cp .env.example .env"
  }
}
```

Then run:
```bash
npm start              # Start with validation
npm run dev           # Development with debug logs
npm run setup         # Generate and copy .env template
npm run validate      # Just validate (no start)
```

The application will only start if all environment variables pass validation.

## Testing

The package includes comprehensive tests covering all features.

Run the full test suite:

```bash
npm test
```

Run tests in watch mode (auto-rerun on changes):

```bash
npm test:watch
```

Generate coverage report:

```bash
npm test:coverage
```

### Test Coverage

The project includes **30+ tests** covering:
- ✅ String, number, and boolean type validation
- ✅ Required and optional variables
- ✅ Missing variable detection
- ✅ Invalid type handling
- ✅ Environment file loading and fallbacks
- ✅ Template generation from schema
- ✅ File overwrite protection
- ✅ Edge cases and error conditions

All tests pass with 100% success rate.

## Development

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/DAbharat/env-guard.git
cd env-guard
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

### Running the CLI Locally

```bash
node src/cli/index.js
```

## Example: Real-World Setup

### Project: Node.js API Server

**env.schema.js**
```javascript
export default {
    DATABASE_URL: { type: "string", required: true },
    DATABASE_PASSWORD: { type: "string", required: true },
    API_PORT: { type: "number", required: true },
    API_HOST: { type: "string", required: false },
    NODE_ENV: { type: "string", required: true },
    LOG_LEVEL: { type: "string", required: false },
    JWT_SECRET: { type: "string", required: true }
};
```

**package.json**
```json
{
  "name": "my-api",
  "scripts": {
    "setup": "env-guard --generate && echo 'Now edit .env with your values'",
    "validate": "env-guard",
    "start": "env-guard && node src/server.js",
    "dev": "env-guard --debug && node --watch src/server.js"
  },
  "dependencies": {
    "env-guard": "^1.0.0"
  }
}
```

**Workflow**

```bash
# 1. First time setup
npm run setup

# 2. Edit .env with actual values
nano .env

# 3. Start server (validates first)
npm start

# 4. Development (with debug logs)
npm run dev
```

## Error Messages

All error messages are prefixed with `[env-guard]:` for easy identification in logs.

Common errors:

```
[env-guard]: Error - .env file not found in project root

[env-guard]: Error - env.schema.js file not found at: /path/to/env.schema.js

[env-guard]: Missing environment variables: DATABASE_URL

[env-guard]: Invalid environment variables: API_PORT

[env-guard]: Warning: .env.example already exists. Skipping generation to avoid overwriting.
```

## Version History

### v1.0.0 (Latest)
- ✨ Initial release
- ✨ Schema-based validation
- ✨ CLI with 7 commands
- ✨ Generate .env.example templates
- ✨ Type checking (string, number, boolean)
- ✨ Multiple .env file support
- ✨ 30+ tests with full coverage

## Requirements

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0

## License

ISC

## Support & Contributing

For issues, feature requests, or questions:
- **GitHub**: https://github.com/DAbharat/env-guard
- **npm Package**: https://www.npmjs.com/package/env-guard
- **Issues**: https://github.com/DAbharat/env-guard/issues

## Author

**DAbharat** - [@DAbharat](https://github.com/DAbharat)

---

**Made with ❤️ for the Node.js community**

