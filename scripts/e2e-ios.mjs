import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const defaultArgs = ["e2e", "run", ".argent/e2e", "--recursive", "--platform", "ios"];

const argentArgs =
  args.length > 0
    ? args[0] === "e2e"
      ? args.slice(1)
      : args[0] === "run"
        ? ["e2e", ...args]
        : ["e2e", "run", ...args]
    : defaultArgs;

const child = spawn("npx", ["argent", ...argentArgs], {
  env: { ...process.env, FORCE_COLOR: "1" },
  stdio: ["inherit", "pipe", "pipe"],
});

const sanitize = (text) =>
  text
    .replace(/\s*\(started on [0-9A-Fa-f-]+\)/g, "")
    .replace(
      /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/g,
      "ios-simulator"
    );

let stdoutBuffer = "";
child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk.toString("utf8");
  const lines = stdoutBuffer.split("\n");
  stdoutBuffer = lines.pop() ?? "";
  for (const line of lines) {
    process.stdout.write(sanitize(line) + "\n");
  }
});
child.stdout.on("end", () => {
  if (stdoutBuffer) {
    process.stdout.write(sanitize(stdoutBuffer));
  }
});

let stderrBuffer = "";
child.stderr.on("data", (chunk) => {
  stderrBuffer += chunk.toString("utf8");
  const lines = stderrBuffer.split("\n");
  stderrBuffer = lines.pop() ?? "";
  for (const line of lines) {
    process.stderr.write(sanitize(line) + "\n");
  }
});
child.stderr.on("end", () => {
  if (stderrBuffer) {
    process.stderr.write(sanitize(stderrBuffer));
  }
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
