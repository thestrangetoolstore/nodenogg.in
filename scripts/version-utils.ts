#!/usr/bin/env node

import { readFileSync } from "fs";
import { execSync } from "child_process";

const rootPackageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const rootVersion = rootPackageJson.version;

function syncVersions() {
  console.log(`Syncing all package versions to ${rootVersion}`);
  execSync(
    `pnpm --recursive exec npm version ${rootVersion} --no-git-tag-version`,
    {
      stdio: "inherit",
    }
  );
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

switch (command) {
  case "sync":
    syncVersions();
    break;
  case "check":
    checkVersions();
    break;
  default:
    console.error("Usage: tsx scripts/version-utils.ts [sync|check]");
    process.exit(1);
}
