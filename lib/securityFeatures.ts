/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'

interface SecurityFeatures {
  csp: boolean
  additionalSecurityHeaders: boolean
  securityLogs: boolean
}

export const securityFeatures: SecurityFeatures = {
  csp: config.get('security.csp.enabled') as boolean,
  additionalSecurityHeaders: config.get('security.additionalHeaders.enabled') as boolean,
  securityLogs: config.get('security.securityLogs.enabled') as boolean
}

export const isSecurityFeatureEnabled = (feature: keyof SecurityFeatures): boolean => Boolean(securityFeatures[feature])

export const getCspDirectives = (): Record<string, string[]> => {
  if (!isSecurityFeatureEnabled('csp')) {
    return {}
  }

  return {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://code.jquery.com', 'https://cdnjs.cloudflare.com', 'https://maxcdn.bootstrapcdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://maxcdn.bootstrapcdn.com'],
    fontSrc: ["'self'", 'https://maxcdn.bootstrapcdn.com'],
    imgSrc: ["'self'", 'data:', 'https://via.placeholder.com'],
    connectSrc: ["'self'"],
    frameSrc: ["'self'"],
    reportUri: '/api/csp/report'
  }
}

export const getAdditionalSecurityHeaders = (): Record<string, string> => {
  if (!isSecurityFeatureEnabled('additionalSecurityHeaders')) {
    return {}
  }

  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'no-referrer'
  }
}