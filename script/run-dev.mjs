import { spawn } from "node:child_process";

const apiHealthUrl = process.env.API_HEALTH_URL || "http://127.0.0.1:5001/api/health";
const timeoutMs = Number.parseInt(process.env.API_WAIT_TIMEOUT_MS || "30000", 10);
const intervalMs = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = (command, args, name) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
      process.exit(code);
    }
  });

  return child;
};

console.log("[dev] starting API...");
run("npm", ["run", "dev:api"], "api");

console.log(`[dev] waiting for API at ${apiHealthUrl} (timeout ${timeoutMs}ms)`);
const deadline = Date.now() + timeoutMs;
let ready = false;

while (Date.now() < deadline) {
  try {
    const res = await fetch(apiHealthUrl);
    if (res.ok) {
      ready = true;
      break;
    }
  } catch (_err) {
    // ignore
  }
  await sleep(intervalMs);
}

if (!ready) {
  console.warn(
    `[dev] API not ready at ${apiHealthUrl} after ${timeoutMs}ms. Starting web anyway.`,
  );
} else {
  console.log("[dev] API ready. Starting web...");
}

run("npm", ["run", "dev:web"], "web");
