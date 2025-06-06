/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { securityFeatures } from '../lib/securityFeatures'
import fs from 'node:fs'
import yaml from 'js-yaml'
import path from 'node:path'

export const getSecurityFeatures = () => (req: Request, res: Response) => {
  res.json({ status: 'success', data: securityFeatures })
}

export const updateSecurityFeature = () => (req: Request, res: Response) => {
  const feature = req.params.feature
  const enabled = req.body.enabled === true

  if (!Object.prototype.hasOwnProperty.call(securityFeatures, feature)) {
    return res.status(400).json({ status: 'error', message: 'Invalid security feature' })
  }

  try {
    // Update in-memory configuration
    securityFeatures[feature as keyof typeof securityFeatures] = enabled

    // Update configuration file
    const configFile = path.resolve('config/default.yml')
    const config = yaml.load(fs.readFileSync(configFile, 'utf8')) as Record<string, any>

    // Create security section if it doesn't exist
    if (!config.security) {
      config.security = {}
    }

    // Create feature section if it doesn't exist
    if (!config.security[feature]) {
      config.security[feature] = {}
    }

    // Update enabled flag
    config.security[feature].enabled = enabled

    // Write back to file
    fs.writeFileSync(configFile, yaml.dump(config), 'utf8')

    res.json({ status: 'success', data: { feature, enabled } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'error', message: 'Could not update security feature' })
  }
}
