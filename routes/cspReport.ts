/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import logger from '../lib/logger'

export const cspReport = () => (req: Request, res: Response) => {
  logger.info('CSP violation report: ' + JSON.stringify(req.body))
  res.status(204).end()
}
