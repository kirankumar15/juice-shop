/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type NextFunction, type Request, type Response } from 'express'
import { retrieveAppConfiguration } from './routes/appConfiguration'
import { retrieveAppVersion } from './routes/appVersion'
import { resetServerStatus } from './lib/startup/resetStatus'
import { restoreOverwrittenFilesWithOriginals } from './lib/startup/restoreOverwrittenFiles'
import { loadDevelopmentData } from './lib/startup/validateDevelopmentData'

const path = require('path')
// eslint-disable-next-line no-unused-vars
const lockFile = require('lockfile')
const recursive = require('recursive-readdir')
const morgan = require('morgan')
const fs = require('fs')
const logger = require('./lib/logger')
const fileUpload = require('express-fileupload')
const applicationConfiguration = require('config')
const security = require('./lib/insecurity')
const Metrics = require('./lib/metrics')
const utils = require('./lib/utils')
const nock = require('nock')
const { BlockchainService } = require('./lib/blockchain')
const { initialize, isBlockchainFeatureEnabled } = require('./routes/web3')
const { checkFetchStatus } = require('./lib/startup/validateConfig')
const multer = require('multer')
const serviceWorkerContent = require('./lib/serviceWorkerContent')
const app = require('express')()

// Import routes
import { getSecurityFeatures, updateSecurityFeature } from './routes/securityFeatures'
import { getCspDirectives, getAdditionalSecurityHeaders, isSecurityFeatureEnabled } from './lib/securityFeatures'
import securityLogger from './lib/securityLogging'
import { cspReport } from './routes/cspReport'

// HTTP options and settings
const httpServer = require('http').Server(app)
const helmet = require('helmet')
const errorhandler = require('errorhandler')
const robots = require('serve-static')
const strict = require('express-strict-transport-security')
const compression = require('compression')
const cors = require('cors')

// Constants and config
const appConfiguration = require('config')
const bodyParser = require('body-parser')
const latestExpressVersion = require('express/package.json').version
const latestNodeVersion = process.versions.node

// Apply base security features first
app.use(cors())
app.use(helmet.noSniff())
app.use(helmet.frameguard())
app.use(helmet.xssFilter())
app.use(strict())
app.use(compression())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'blob:', 'platform.twitter.com/img/*', 'cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@*/css/*'],
    styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'platform.twitter.com/css/*', 'cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@*/css/*'],
    fontSrc: ["'self'", 'fonts.gstatic.com/s/roboto/*', 'cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@*/webfonts/*'],
    connectSrc: ["'self'"],
    scriptSrc: ["'self'", 'platform.twitter.com/widgets.js', 'www.google.com/recaptcha/', 'www.gstatic.com/recaptcha/', "'unsafe-inline'", "'unsafe-eval'"],
    frameSrc: ["'self'", 'www.youtube.com', 'www.google.com/recaptcha/'],
    payment: ["'self'"]
  }
}))

/* Enhanced Security Features */

// Apply Content Security Policy if enabled
if (isSecurityFeatureEnabled('csp')) {
  app.use(helmet.contentSecurityPolicy({
    directives: getCspDirectives(),
    reportOnly: true // Use report-only mode to not break functionality
  }))
}

// Apply additional security headers if enabled
if (isSecurityFeatureEnabled('additionalHeaders')) {
  const additionalHeaders = getAdditionalSecurityHeaders()
  app.use((req, res, next) => {
    Object.entries(additionalHeaders).forEach(([header, value]) => {
      res.setHeader(header, value)
    })
    next()
  })
}

// Apply security logging if enabled
app.use(securityLogger)

// CSP violation reporting endpoint
app.post('/api/csp/report', cspReport())

/* Hiring header */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Hiring', 'GET https://jobs.owasp.org/')
  next()
})

// REST API routes
app.get('/rest/admin/application-configuration', retrieveAppConfiguration())
app.get('/rest/admin/application-version', retrieveAppVersion())
app.get('/rest/admin/security-features', security.isAuthorized(), security.isAccounting(), getSecurityFeatures())
app.put('/rest/admin/security-features/:feature', security.isAuthorized(), security.isAccounting(), updateSecurityFeature())

// Error handling and cleanup functions
export async function start (readyCallback?: () => void) {
  try {
    console.log(`Starting OWASP Juice Shop ${appConfiguration.get('application.name')} v${appConfiguration.get('application.version')}`)
    await checkFetchStatus()
    await resetServerStatus()
    await restoreOverwrittenFilesWithOriginals()
    await loadDevelopmentData()
    if (isBlockchainFeatureEnabled()) {
      await initialize()
    }
    if (readyCallback) {
      readyCallback()
    }
  } catch (error) {
    logger.error(`Error during startup: ${error.message}`)
  }
}

export function close (exitCode: number | undefined) {
  console.log(`Closing down OWASP Juice Shop ${appConfiguration.get('application.name')} v${appConfiguration.get('application.version')}`)
  lockFile.unlockSync('juiceshop.lock')
  process.exit(exitCode ?? 0)
}

// Export for testing
export default app