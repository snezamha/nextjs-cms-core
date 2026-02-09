import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });

    child.on("close", (code) => resolve(code ?? 1));
  });
}

const code = await run("pnpm", ["exec", "prisma", "generate"]);
process.exit(code);
