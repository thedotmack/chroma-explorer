/**
 * Input validation utilities for IPC handlers
 * Provides security validation for user inputs
 */

/**
 * Validate that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validate collection name to prevent injection attacks
 * Collection names should be alphanumeric with limited special characters
 */
export function isValidCollectionName(name: unknown): boolean {
  if (!isNonEmptyString(name)) {
    return false
  }
  
  // Allow alphanumeric, hyphens, underscores, and dots
  // Limit length to prevent abuse
  const collectionNameRegex = /^[a-zA-Z0-9._-]{1,255}$/
  return collectionNameRegex.test(name)
}

/**
 * Validate document ID
 */
export function isValidDocumentId(id: unknown): boolean {
  if (!isNonEmptyString(id)) {
    return false
  }
  
  // Document IDs should be reasonable length
  return id.length <= 1000
}

/**
 * Validate profile ID (UUID format)
 */
export function isValidProfileId(id: unknown): boolean {
  if (!isNonEmptyString(id)) {
    return false
  }
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Sanitize metadata to prevent prototype pollution
 */
export function sanitizeMetadata(metadata: unknown): Record<string, unknown> | null {
  if (metadata === null || metadata === undefined) {
    return null
  }
  
  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }
  
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(metadata)) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    
    // Only allow safe value types
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Validate URL format
 */
export function isValidUrl(url: unknown): boolean {
  if (!isNonEmptyString(url)) {
    return false
  }
  
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
