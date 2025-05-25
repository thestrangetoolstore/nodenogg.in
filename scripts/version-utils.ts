#!/usr/bin/env node

import { readFileSync } from "fs";
import { execSync } from "child_process";

const rootPackageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const rootVersion = rootPackageJson.version;

function syncVersions(shouldCommit = false) {
  console.log(`Syncing all package versions to ${rootVersion}`);
  execSync(
    `pnpm --recursive exec npm version ${rootVersion} --no-git-tag-version`,
    {
      stdio: "inherit",
    }
  );
  
  if (shouldCommit) {
    console.log("Adding synced package.json files to git...");
    execSync("git add .", { stdio: "inherit" });
    console.log("Amending last commit with version sync changes...");
    execSync("git commit --amend --no-edit", { stdio: "inherit" });
  }
}

function checkVersions() {
  console.log(`Root: ${rootVersion}`);

  try {
    const output = execSync(
      `pnpm --recursive exec node -p "JSON.stringify({name: require('./package.json').name, version: require('./package.json').version})"`,
      { encoding: "utf-8" }
    );

    const lines = output.trim().split("\n");
    let hasErrors = false;

    for (const line of lines) {
      if (line.trim()) {
        try {
          const pkg = JSON.parse(line.trim());
          if (pkg.version !== rootVersion) {
            console.error(
              `❌ ${pkg.name}: ${pkg.version} (expected: ${rootVersion})`
            );
            hasErrors = true;
          } else {
            console.log(`✅ ${pkg.name}: ${pkg.version}`);
          }
        } catch (e) {
          // Skip lines that aren't JSON (like pnpm output)
        }
      }
    }

    if (hasErrors) {
      console.error(
        '\n💥 Version mismatch detected! Run "pnpm version:sync" to fix.'
      );
      process.exit(1);
    } else {
      console.log("\n✨ All package versions match!");
    }
  } catch (error) {
    console.error("Error checking versions:", error);
    process.exit(1);
  }
}

const command = process.argv[2];
const flags = process.argv.slice(3);

switch (command) {
  case "sync":
    const shouldCommit = flags.includes("--commit");
    syncVersions(shouldCommit);
    break;
  case "check":
    checkVersions();
    break;
  default:
    console.error("Usage: tsx scripts/version-utils.ts [sync|check] [--commit]");
    process.exit(1);
}
