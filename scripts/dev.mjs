import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const processes = [
  {
    name: "api",
    command: "php",
    args: ["artisan", "serve", "--host=127.0.0.1", "--port=8000"],
    cwd: join(rootDir, "Nexora"),
    shell: false,
  },
  {
    name: "web",
    command: isWindows
      ? `${npmCommand} run dev -- --host 127.0.0.1 --port 5173 --strictPort`
      : npmCommand,
    args: isWindows
      ? []
      : ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
    cwd: join(rootDir, "nexora-web"),
    shell: isWindows,
  },
];

const children = processes.map(({ name, command, args, cwd, shell }) => {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      return;
    }

    console.log(`[${name}] exited with code ${code}`);
    stopAll();
    process.exit(code ?? 0);
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    stopAll();
    process.exit(1);
  });

  return child;
});

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});
