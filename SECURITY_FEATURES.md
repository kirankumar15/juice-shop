# Security Features in OWASP Juice Shop

This document describes the additional security features that have been added to OWASP Juice Shop. These features are designed to enhance the security of the application while maintaining its educational purpose as an intentionally vulnerable web application.

## Overview

The following security features have been implemented:

1. **Content Security Policy (CSP)**
2. **Additional Security Headers**
3. **Security Logging**

All features can be toggled on/off via the admin interface or by modifying the configuration file.

## Content Security Policy (CSP)

Content Security Policy is a security standard that helps prevent cross-site scripting (XSS), clickjacking, and other code injection attacks. CSP works by specifying which content sources are considered trusted, and only allowing scripts, stylesheets, and other resources to be loaded from those sources.

### Configuration

CSP is configured in `lib/securityFeatures.ts` and can be enabled/disabled in the configuration file or via the admin interface.

```yaml
security:
  csp:
    enabled: true
```

### Implementation

The CSP implementation uses the following directives:

- `defaultSrc`: Restricts the sources of content to 'self'
- `scriptSrc`: Allows scripts from 'self', inline scripts, and specific CDNs
- `styleSrc`: Allows styles from 'self', inline styles, and specific CDNs
- `fontSrc`: Allows fonts from 'self' and specific CDNs
- `imgSrc`: Allows images from 'self', data URIs, and specific domains
- `connectSrc`: Restricts AJAX, WebSocket, and EventSource connections to 'self'
- `frameSrc`: Restricts iframe sources to 'self'
- `reportUri`: Specifies where CSP violation reports should be sent

The CSP is implemented in report-only mode to avoid breaking functionality while still providing visibility into potential violations.

## Additional Security Headers

Additional security headers provide an extra layer of protection against various attacks.

### Configuration

Additional security headers can be enabled/disabled in the configuration file or via the admin interface.

```yaml
security:
  additionalHeaders:
    enabled: true
```

### Implementation

The following security headers are implemented:

- `X-Content-Type-Options: nosniff`: Prevents browsers from MIME-sniffing a response away from the declared content-type
- `X-Frame-Options: SAMEORIGIN`: Prevents the page from being displayed in an iframe on other sites
- `X-XSS-Protection: 1; mode=block`: Enables the browser's XSS filter
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforces HTTPS
- `Referrer-Policy: no-referrer`: Controls how much referrer information should be included with requests

## Security Logging

Security logging provides visibility into security-relevant events in the application.

### Configuration

Security logging can be enabled/disabled in the configuration file or via the admin interface.

```yaml
security:
  securityLogs:
    enabled: true
```

### Implementation

The security logging middleware logs the following events:

- Authentication attempts
- Access to sensitive endpoints (POST, PUT, DELETE requests to API endpoints)
- File upload attempts
- HTTP responses with error status codes (4xx, 5xx)
- CSP violation reports

Logs are written to the standard application log file.

## Admin Interface

Security features can be managed via the admin interface at `/rest/admin/security-features`. This endpoint is only accessible to users with the 'accounting' role.

### API Endpoints

- `GET /rest/admin/security-features`: Get the current status of all security features
- `PUT /rest/admin/security-features/:feature`: Update the status of a specific security feature

## Important Note

These security features are designed to enhance the security of the application while maintaining its educational purpose. They do not fix the intentional vulnerabilities in the application, but rather provide an additional layer of protection that can be toggled on/off for demonstration purposes.