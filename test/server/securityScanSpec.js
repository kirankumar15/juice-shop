/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
const expect = chai.expect
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

describe('Security Scanning', () => {
  describe('SBOM Generation', () => {
    it('should have SBOM generation scripts in package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      expect(packageJson.scripts.sbom).to.be.a('string')
      expect(packageJson.scripts['sbom:json']).to.be.a('string')
      expect(packageJson.scripts['sbom:xml']).to.be.a('string')
    })

    it('should have CycloneDX npm package installed', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      const devDependencies = packageJson.devDependencies
      expect(devDependencies).to.have.property('@cyclonedx/cyclonedx-npm')
    })
  })

  describe('Security Scanning Script', () => {
    it('should have security scanning scripts in package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      expect(packageJson.scripts['security-scan']).to.be.a('string')
      expect(packageJson.scripts['security-scan:sast']).to.be.a('string')
      expect(packageJson.scripts['security-scan:sca']).to.be.a('string')
      expect(packageJson.scripts['security-scan:sbom']).to.be.a('string')
    })

    it('should have a security scanning script file', () => {
      expect(fs.existsSync(path.join('scripts', 'security-scan.js'))).to.be.true
    })
  })

  describe('GitHub Actions Workflows', () => {
    it('should have security scanning workflow files', () => {
      expect(fs.existsSync(path.join('.github', 'workflows', 'security-scan.yml'))).to.be.true
      expect(fs.existsSync(path.join('.github', 'workflows', 'codeql-analysis.yml'))).to.be.true
    })
  })

  describe('Security Scanning Documentation', () => {
    it('should have security scanning documentation', () => {
      expect(fs.existsSync('SECURITY-SCANNING.md')).to.be.true
    })
  })
})