/**
 * Posts reports/cucumber-report/report.json to Playlure's
 * POST /api/ingest/results, signed the same way the backend's
 * verifyIngestSignature middleware expects (HMAC-SHA256 over the raw body).
 *
 * Usage: npm run publish:playlure
 * Required env vars: see .env.example
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";

const REPORT_PATH = "reports/cucumber-report/report.json";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  if (!existsSync(REPORT_PATH)) {
    throw new Error(
      `${REPORT_PATH} not found - run "npm test" (or test:ui / test:api) first to generate it.`
    );
  }

  const playlureUrl = process.env.PLAYLURE_URL || "http://localhost:4000";
  const pipelineId = requireEnv("PLAYLURE_PIPELINE_ID");
  const secret = requireEnv("INGEST_SHARED_SECRET");
  const githubRunId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
  const branch = process.env.BRANCH || "main";
  const environment = process.env.ENVIRONMENT || "QA_REGRESSION";

  const cucumberJson = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));

  const body = JSON.stringify({
    pipelineId,
    githubRunId,
    githubRunUrl: process.env.GITHUB_RUN_URL,
    branch,
    commitSha: process.env.GITHUB_SHA,
    environment,
    triggeredBy: process.env.GITHUB_ACTOR || "local-run",
    cucumberJson,
  });

  const signature = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");

  const res = await fetch(`${playlureUrl}/api/ingest/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Playlure-Signature": signature,
    },
    body,
  });

  const responseBody = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Playlure ingest failed (${res.status}): ${JSON.stringify(responseBody)}`);
  }

  console.log("Published to Playlure:", responseBody);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
