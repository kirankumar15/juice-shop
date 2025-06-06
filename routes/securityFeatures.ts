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
  const enabled = Boolean(req.body.enabled)

  if (!Object.prototype.hasOwnProperty.call(securityFeatures, feature)) {
    return res.status(400).json({ status: 'error', message: 'Invalid security feature' })
  }

  try {
    securityFeatures[feature as keyof typeof securityFeatures] = enabled
    const configFile = path.resolve('config/default.yml')
    const config = yaml.load(fs.readFileSync(configFile, 'utf8')) as Record<string, any>

    if (!config.security) {
      config.security = {}
    }

    if (!config.security[feature]) {
      config.security[feature] = {}
    }

    config.security[feature].enabled = enabled
    fs.writeFileSync(configFile, yaml.dump(config), 'utf8')

    res.json({ status: 'success', data: { feature, enabled } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'error', message: 'Could not update security feature' })
  }
}