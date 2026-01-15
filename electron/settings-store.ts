import Store from 'electron-store'
import { app } from 'electron'
import { createHash } from 'crypto'

export interface ApiKeys {
  OPENAI_API_KEY?: string
  COHERE_API_KEY?: string
  GEMINI_API_KEY?: string
  JINA_API_KEY?: string
  MISTRAL_API_KEY?: string
  VOYAGE_API_KEY?: string
  TOGETHER_API_KEY?: string
  CLOUDFLARE_ACCOUNT_ID?: string
  CLOUDFLARE_API_KEY?: string
  MORPH_API_KEY?: string
}

interface SettingsSchema {
  apiKeys: ApiKeys
}

/**
 * Generate a device-specific encryption key for secure storage.
 * Uses machine ID and app path to create a unique key per installation.
 */
function generateEncryptionKey(): string {
  const machineId = require('node-machine-id').machineIdSync()
  const appPath = app.getPath('userData')
  const combined = `${machineId}:${appPath}:chroma-explorer-v1`
  return createHash('sha256').update(combined).digest('hex')
}

const store = new Store<SettingsSchema>({
  name: 'chroma-settings',
  defaults: {
    apiKeys: {},
  },
  encryptionKey: generateEncryptionKey(),
})

export class SettingsStore {
  getApiKeys(): ApiKeys {
    return store.get('apiKeys', {})
  }

  setApiKeys(keys: ApiKeys): void {
    store.set('apiKeys', keys)
    this.injectIntoProcessEnv()
  }

  setApiKey(envVar: keyof ApiKeys, value: string | undefined): void {
    const apiKeys = this.getApiKeys()
    if (value) {
      apiKeys[envVar] = value
    } else {
      delete apiKeys[envVar]
    }
    store.set('apiKeys', apiKeys)
    this.injectIntoProcessEnv()
  }

  // Inject all stored API keys into process.env
  injectIntoProcessEnv(): void {
    const apiKeys = this.getApiKeys()
    for (const [key, value] of Object.entries(apiKeys)) {
      if (value) {
        process.env[key] = value
      }
    }
  }
}

export const settingsStore = new SettingsStore()
