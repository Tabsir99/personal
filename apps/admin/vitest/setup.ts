// Loads the admin app's .env into process.env so integration tests can
// reach ANTHROPIC_AUTH_TOKEN without the user manually exporting it.
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env"), override: false });
config({ path: resolve(__dirname, "../.env.local"), override: true });
