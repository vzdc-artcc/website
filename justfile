# vZDC website task runner. Wraps the npm scripts; `just ci` runs the same
# steps as .github/workflows/build-test.yml.
set shell := ["bash", "-cu"]

# List recipes
default:
    @just --list

# --- setup ---

# Install dependencies (--legacy-peer-deps matches CI and the Dockerfile)
install:
    npm install --legacy-peer-deps

[private]
install-frozen:
    npm ci --legacy-peer-deps

# --- run ---

# Next dev server on :3000 (turbopack)
dev:
    npm run dev

# Next dev server on :3001, the `website-dev` config in .claude/launch.json
dev-3001:
    npm run dev -- -p 3001

# Serve the production build from `just build`
start:
    npm run start

# --- checks ---

# Values exported from .env.public take precedence over .env.local for the same
# keys, matching CI, which builds with .env.public renamed to .env.

# Production build with the committed public env, as CI does
build:
    set -a; . ./.env.public; set +a; npm run build

# Type-check without building (faster than `just build` for a quick check)
typecheck:
    npx tsc --noEmit

# Broken until website #180 (`next lint` was removed in Next 16), so it is not
# part of `just ci`.

# ESLint (currently broken, see #180)
lint:
    npm run lint

# Every check CI runs, in CI order. Must pass before a PR.
ci: install-frozen build

# --- osmium contract ---

# Source: OSMIUM_OPENAPI_URL, default http://127.0.0.1:3000/docs/api/v1/openapi.json

# Regenerate lib/osmium/generated/schema.d.ts from a running osmium
codegen:
    npm run codegen:osmium

# Build the production Docker image locally
docker-build tag="website:local":
    docker build -t {{ tag }} .
