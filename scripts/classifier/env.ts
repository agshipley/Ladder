import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load the Ladder repo-root .env regardless of the harness's CWD. The operator
 * keeps all instance secrets (ANTHROPIC_API_KEY, CLASSIFIER_QUERY_TOKEN, …) in
 * Ladder/.env (gitignored); this module lives at scripts/classifier/, two levels
 * down, so the root is ../../. Import this once, first, in any entrypoint.
 * Values are never logged or printed.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(HERE, "../../.env") });
