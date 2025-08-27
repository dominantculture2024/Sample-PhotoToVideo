#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 讀取 package.json 獲取當前版本
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// 解析版本號並遞增
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
const patchVersion = parseInt(versionParts[2]) + 1;
const newVersion = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

// 更新 package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 更新 index.html 中的版本號
const indexHtmlPath = join(projectRoot, 'index.html');
let indexHtml = readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(
  /<title>Photo to Video Converter v[\d\.]+<\/title>/,
  `<title>Photo to Video Converter v${newVersion}</title>`
);
writeFileSync(indexHtmlPath, indexHtml);

console.log(`版本號已更新: ${currentVersion} -> ${newVersion}`);
console.log('已更新文件:');
console.log('- package.json');
console.log('- index.html');