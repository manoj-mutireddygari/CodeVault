import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "extension", "dist");
const outputDir = path.join(rootDir, "dashboard", "public");
const outputFile = path.join(outputDir, "CodeVault.zip");

if (!fs.existsSync(distDir)) {
  console.error("Error: extension/dist folder does not exist. Build the extension first.");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

console.log("Zipping extension/dist to dashboard/public/CodeVault.zip...");

try {
  if (process.platform === "win32") {
    execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${outputFile}' -Force"`);
  } else {
    execSync(`cd "${distDir}" && zip -r -q "${outputFile}" .`);
  }
  console.log(`Successfully created ${outputFile}`);
} catch (error) {
  console.error("Failed to create zip file:", error);
  process.exit(1);
}
