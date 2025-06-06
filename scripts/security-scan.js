#!/usr/bin/env node

/**
 * Local Security Scanning Script
 * 
 * This script runs various security scans locally:
 * - SAST (Static Application Security Testing)
 * - SCA (Software Composition Analysis)
 * - SBOM (Software Bill of Materials) generation
 * 
 * Usage: node scripts/security-scan.js [options]
 * Options:
 *   --sast    Run only SAST scans
 *   --sca     Run only SCA scans
 *   --sbom    Generate only SBOM
 *   --all     Run all scans (default)
 *   --help    Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const runSast = args.includes('--sast') || args.includes('--all') || args.length === 0;
const runSca = args.includes('--sca') || args.includes('--all') || args.length === 0;
const runSbom = args.includes('--sbom') || args.includes('--all') || args.length === 0;
const showHelp = args.includes('--help');

if (showHelp) {
  console.log(`
Security Scanning Script

Usage: node scripts/security-scan.js [options]
Options:
  --sast    Run only SAST scans
  --sca     Run only SCA scans
  --sbom    Generate only SBOM
  --all     Run all scans (default)
  --help    Show this help message
  `);
  process.exit(0);
}

console.log('Starting security scans...');

// Function to run a command and handle errors
function runCommand(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${errorMessage}: ${error.message}`);
    return false;
  }
}

// SAST Scans
if (runSast) {
  console.log('\n=== Running SAST Scans ===\n');
  
  // Check if ESLint is installed
  try {
    execSync('npx eslint --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('Installing ESLint security plugins...');
    runCommand('npm install --save-dev eslint eslint-plugin-security eslint-plugin-node eslint-plugin-sonarjs', 
      'Failed to install ESLint plugins');
  }

  // Create ESLint security config if it doesn't exist
  const eslintConfigPath = path.join(__dirname, '..', '.eslintrc.security.json');
  if (!fs.existsSync(eslintConfigPath)) {
    console.log('Creating ESLint security configuration...');
    const eslintConfig = {
      "extends": [
        "plugin:security/recommended",
        "plugin:sonarjs/recommended"
      ],
      "plugins": [
        "security",
        "sonarjs"
      ]
    };
    fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
  }

  // Run ESLint security scan
  const eslintReportDir = path.join(reportsDir, 'eslint');
  if (!fs.existsSync(eslintReportDir)) {
    fs.mkdirSync(eslintReportDir, { recursive: true });
  }
  
  runCommand(
    `npx eslint -c .eslintrc.security.json --format json --output-file ${path.join(eslintReportDir, 'security-report.json')} "**/*.{js,ts}"`,
    'ESLint security scan failed'
  );

  console.log('\nSAST scan completed. Results saved to reports/eslint/security-report.json');
}

// SCA Scans
if (runSca) {
  console.log('\n=== Running SCA Scans ===\n');
  
  // Create npm audit directory
  const npmAuditDir = path.join(reportsDir, 'npm-audit');
  if (!fs.existsSync(npmAuditDir)) {
    fs.mkdirSync(npmAuditDir, { recursive: true });
  }

  // Run npm audit
  console.log('Running npm audit...');
  try {
    execSync(`npm audit --json > ${path.join(npmAuditDir, 'npm-audit-report.json')}`, { stdio: 'inherit' });
  } catch (error) {
    console.log('npm audit found vulnerabilities. Check the report for details.');
  }

  // Run npm audit for frontend
  console.log('Running npm audit for frontend...');
  try {
    execSync(`cd frontend && npm audit --json > ${path.join('..', npmAuditDir, 'frontend-npm-audit-report.json')}`, { stdio: 'inherit' });
  } catch (error) {
    console.log('npm audit for frontend found vulnerabilities. Check the report for details.');
  }

  console.log('\nSCA scan completed. Results saved to reports/npm-audit/');
}

// SBOM Generation
if (runSbom) {
  console.log('\n=== Generating SBOM ===\n');
  
  // Create SBOM directory
  const sbomDir = path.join(reportsDir, 'sbom');
  if (!fs.existsSync(sbomDir)) {
    fs.mkdirSync(sbomDir, { recursive: true });
  }

  // Check if CycloneDX is installed
  try {
    execSync('cyclonedx-npm --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('Installing CycloneDX...');
    runCommand('npm install -g @cyclonedx/cyclonedx-npm', 'Failed to install CycloneDX');
  }

  // Generate CycloneDX SBOM
  console.log('Generating CycloneDX SBOM...');
  runCommand(
    `cyclonedx-npm --output-format JSON --output-file ${path.join(sbomDir, 'bom.json')}`,
    'Failed to generate CycloneDX JSON SBOM'
  );
  runCommand(
    `cyclonedx-npm --output-format XML --output-file ${path.join(sbomDir, 'bom.xml')}`,
    'Failed to generate CycloneDX XML SBOM'
  );

  // Check if SPDX SBOM Generator is installed
  try {
    execSync('spdx-sbom-generator --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('Installing SPDX SBOM Generator...');
    runCommand('npm install -g spdx-sbom-generator', 'Failed to install SPDX SBOM Generator');
  }

  // Generate SPDX SBOM
  console.log('Generating SPDX SBOM...');
  runCommand(
    `spdx-sbom-generator -p . -o ${sbomDir}`,
    'Failed to generate SPDX SBOM'
  );

  console.log('\nSBOM generation completed. Results saved to reports/sbom/');
}

console.log('\nAll security scans completed!');
console.log('Check the reports directory for results.');