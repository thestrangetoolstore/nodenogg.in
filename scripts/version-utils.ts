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
  execSync(
    `pnpm --recursive exec node -p "require('./package.json').name + ': ' + require('./package.json').version"`,
    {
      stdio: "inherit",
    }
  );
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
