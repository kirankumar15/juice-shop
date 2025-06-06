/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('Security Features', () => {
  const securityFeatures = require('../../lib/securityFeatures')

  describe('isSecurityFeatureEnabled', () => {
    it('should return false for disabled features', () => {
      securityFeatures.securityFeatures.csp = false
      expect(securityFeatures.isSecurityFeatureEnabled('csp')).to.equal(false)
    })

    it('should return true for enabled features', () => {
      securityFeatures.securityFeatures.csp = true
      expect(securityFeatures.isSecurityFeatureEnabled('csp')).to.equal(true)
    })
  })

  describe('getCspDirectives', () => {
    it('should return empty object when CSP is disabled', () => {
      securityFeatures.securityFeatures.csp = false
      expect(securityFeatures.getCspDirectives()).to.deep.equal({})
    })

    it('should return CSP directives when CSP is enabled', () => {
      securityFeatures.securityFeatures.csp = true
      const directives = securityFeatures.getCspDirectives()
      expect(directives).to.have.property('defaultSrc')
      expect(directives).to.have.property('scriptSrc')
      expect(directives).to.have.property('styleSrc')
    })
  })

  describe('getAdditionalSecurityHeaders', () => {
    it('should return empty object when additional headers are disabled', () => {
      securityFeatures.securityFeatures.additionalSecurityHeaders = false
      expect(securityFeatures.getAdditionalSecurityHeaders()).to.deep.equal({})
    })

    it('should return security headers when additional headers are enabled', () => {
      securityFeatures.securityFeatures.additionalSecurityHeaders = true
      const headers = securityFeatures.getAdditionalSecurityHeaders()
      expect(headers).to.have.property('X-Content-Type-Options')
      expect(headers).to.have.property('X-Frame-Options')
      expect(headers).to.have.property('X-XSS-Protection')
    })
  })
})
