# Security Scanning Guide

This document provides information on how to use the security scanning capabilities implemented in this repository.

## Overview

The security scanning setup includes:

1. **Static Application Security Testing (SAST)** - Analyzes source code for security vulnerabilities
2. **Software Composition Analysis (SCA)** - Identifies vulnerabilities in dependencies
3. **Software Bill of Materials (SBOM)** - Generates inventory of software components
4. **Dynamic Application Security Testing (DAST)** - Tests running application for vulnerabilities

## Running Security Scans Locally

### Prerequisites

- Node.js (version 18-22)
- npm

### Available Commands

The following npm scripts are available for security scanning:

```bash
# Run all security scans
npm run security-scan

# Run only SAST scan
npm run security-scan:sast

# Run only SCA scan
npm run security-scan:sca

# Generate only SBOM
npm run security-scan:sbom

# Run security scan before committing code
npm run precommit
```

If you want to make the script directly executable:

```bash
# Make the script executable
chmod +x scripts/security-scan.js

# Run the script directly
./scripts/security-scan.js
```

### Reports

All scan reports are saved in the `reports/` directory:

- SAST reports: `reports/eslint/`
- SCA reports: `reports/npm-audit/`
- SBOM files: `reports/sbom/`

## CI/CD Integration

Security scanning is integrated into the CI/CD pipeline using GitHub Actions. The workflow file is located at `.github/workflows/security-scan.yml`.

### Workflow Triggers

The security scanning workflow runs on:

- Push to main, master, or develop branches
- Pull requests to main, master, or develop branches
- Manual trigger from GitHub Actions UI

### Manual Workflow Execution

You can manually run the security scanning workflow from the GitHub Actions tab:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Comprehensive Security Scan" workflow
3. Click "Run workflow"
4. Choose which type of scan to run (all, sast, sca, dast, or sbom)
5. Click "Run workflow"

## SBOM Formats

The SBOM is generated in two formats:

1. **CycloneDX** - A lightweight SBOM standard designed for application security contexts
   - JSON format: `reports/sbom/bom.json`
   - XML format: `reports/sbom/bom.xml`

2. **SPDX** - A standard format for communicating software bill of materials information
   - Generated in `reports/sbom/` directory

## Security Tools Used

### SAST Tools

- **CodeQL** - GitHub's semantic code analysis engine
- **ESLint with security plugins** - JavaScript/TypeScript linter with security rules
- **NodeJsScan** - Static security code scanner for Node.js applications

### SCA Tools

- **npm audit** - Scans dependencies for known vulnerabilities
- **Snyk** - Finds and fixes vulnerabilities in dependencies

### DAST Tools

- **OWASP ZAP** - Web application security scanner

## Integration with Development Workflow

For the best security practices:

1. Run `npm run precommit` before committing code to check for security issues
2. Review security scan results in GitHub Actions after pushing code
3. Address any security vulnerabilities found before merging pull requests

## Troubleshooting

If you encounter issues with the security scanning:

1. Make sure all dependencies are installed: `npm install`
2. Check that you have the required permissions for GitHub Actions
3. For local scans, ensure you have sufficient disk space for reports

For more help, please open an issue in the repository.