#!/usr/bin/env node

const { spawn } = require("child_process");

console.log("🔨 Compiling Hardhat contracts...\n");

// Step 1: Compile Hardhat contracts
const compile = spawn("npx", ["hardhat", "compile"], {
  stdio: "inherit",
  shell: true,
});

compile.on("close", (code) => {
  if (code !== 0) {
    console.error(`\n❌ Hardhat compilation failed with code ${code}`);
    process.exit(code);
  }

  console.log("\n✅ Contracts compiled successfully!");
  console.log("🚀 Starting Next.js dev server...\n");

  // Step 2: Start Next.js dev server
  const nextDev = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
  });

  nextDev.on("close", (code) => {
    process.exit(code);
  });

  // Handle termination signals
  process.on("SIGINT", () => {
    nextDev.kill("SIGINT");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    nextDev.kill("SIGTERM");
    process.exit(0);
  });
});
