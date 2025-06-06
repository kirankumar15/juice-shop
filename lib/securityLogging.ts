/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import logger from './logger'
import { isSecurityFeatureEnabled } from './securityFeatures'

export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (!isSecurityFeatureEnabled('securityLogs')) {
    next()
    return
  }

  // Log authentication attempts
  if (req.path === '/rest/user/login') {
    logger.info(`Security: Authentication attempt from IP ${req.ip}`)
  }

  // Log access to sensitive endpoints
  if (req.path.includes('/api/') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
    logger.info(`Security: ${req.method} request to ${req.path} from IP ${req.ip}`)
  }

  // Log file uploads
  if (req.path === '/file-upload') {
    logger.info(`Security: File upload attempt from IP ${req.ip}`)
  }

  // Log original response status
  const originalSend = res.send
  res.send = function (body) {
    if (res.statusCode >= 400) {
      logger.info(`Security: Response with status ${res.statusCode} for ${req.method} ${req.path} from IP ${req.ip}`)
    }
    return originalSend.call(this, body)
  }
  next()
}

export default securityLogger