# Security Policy

## Overview

Chroma Explorer is a desktop application for managing ChromaDB vector databases. This document outlines the security measures implemented in the application and best practices for users.

## Security Features

### 1. Encrypted Storage

**API Keys and Connection Profiles**: All sensitive data is stored using `electron-store` with device-specific encryption:

- **Device-Specific Encryption Keys**: Instead of hardcoded keys, the application generates a unique encryption key for each installation using:
  - Machine ID (unique hardware identifier)
  - User data path
  - Application-specific salt
  
- **Stored Data**:
  - API keys for embedding providers (OpenAI, Cohere, Gemini, etc.)
  - Database connection profiles (URLs, credentials)
  - User preferences and overrides

### 2. Content Security Policy (CSP)

The application implements a strict Content Security Policy to prevent XSS attacks and code injection:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';  // Required for Tailwind CSS
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' http: https: ws: wss:;  // ChromaDB connections
worker-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

### 3. Security Headers

Additional HTTP security headers are applied:

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filtering
- **Referrer-Policy**: `no-referrer` - Prevents referrer leakage

### 4. IPC Security

**Context Isolation**: All windows use `contextIsolation: true` to prevent renderer processes from accessing Node.js APIs directly.

**Input Validation**: All IPC handlers validate inputs to prevent:
- Collection name injection
- Document ID injection  
- Profile ID validation (UUID format)
- Metadata sanitization (prevents prototype pollution)

**URL Validation**: The `shell.openExternal` handler only allows HTTP and HTTPS protocols to prevent arbitrary command execution.

### 5. Node Integration Disabled

All windows have `nodeIntegration: false` to prevent direct Node.js access from renderer processes.

### 6. Preload Script

A secure preload script exposes only necessary APIs to the renderer via `contextBridge`, following the principle of least privilege.

## Known Vulnerabilities

### Dependency Vulnerabilities

The following vulnerabilities exist in third-party dependencies:

1. **qs (<6.14.1)** - High severity
   - Issue: DoS via memory exhaustion through arrayLimit bypass
   - Source: Transitive dependency via `voyageai` → `@chroma-core/voyageai`
   - Mitigation: Not directly exploitable in desktop context; no user-controlled query string parsing
   - Status: No fix available (upstream dependency)

2. **undici (<6.23.0)** - Low severity  
   - Issue: Unbounded decompression in HTTP responses
   - Source: Transitive dependency via `testcontainers`
   - Mitigation: Only used in development/testing contexts
   - Status: Fixed in latest version

### Risk Assessment

- **qs vulnerability**: Low risk in Electron desktop context as the application doesn't expose query string parsing to untrusted input
- **testcontainers vulnerability**: No risk as it's a development dependency

## Security Best Practices

### For Users

1. **API Key Management**:
   - Only enter API keys in the official Settings window
   - API keys are stored encrypted on your local machine
   - Never share your user data directory (`~/.config/chroma-explorer` or equivalent)

2. **Connection Security**:
   - Use HTTPS/SSL when connecting to remote ChromaDB instances
   - Verify connection URLs before connecting
   - Be cautious with untrusted ChromaDB servers

3. **System Security**:
   - Keep your operating system updated
   - Use disk encryption on your device
   - Regularly update Chroma Explorer to the latest version

### For Developers

1. **Code Review**:
   - All IPC handlers must validate inputs
   - Use the validation utilities in `electron/input-validation.ts`
   - Never trust renderer process input

2. **Adding Dependencies**:
   - Run `npm audit` before adding new dependencies
   - Check GitHub Security Advisories for known vulnerabilities
   - Prefer well-maintained packages with security track records

3. **IPC Handler Pattern**:
   ```typescript
   ipcMain.handle('handler:name', async (_event, param: string) => {
     try {
       // Validate inputs
       if (!isValidInput(param)) {
         return { success: false, error: 'Invalid input' }
       }
       
       // Perform operation
       const result = await operation(param)
       return { success: true, data: result }
     } catch (error) {
       return { 
         success: false, 
         error: error instanceof Error ? error.message : 'Unknown error'
       }
     }
   })
   ```

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Chroma Explorer, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond to security reports within 48 hours.

## Security Audit History

- **2026-01-15**: Initial comprehensive security review
  - Replaced hardcoded encryption keys with device-specific keys
  - Added URL validation for external link opening
  - Enhanced Content Security Policy
  - Added input validation for IPC handlers
  - Documented known vulnerabilities in dependencies

## References

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [ChromaDB Security](https://docs.trychroma.com/guides/security)
