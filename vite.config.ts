import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const storageFileName = 'forge-data.json'
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')) as {
  version?: string
}
const appVersion = packageJson.version ?? '0.0.0'
const forgeDataDir = process.env.FORGE_DATA_DIR
  ? path.resolve(process.env.FORGE_DATA_DIR)
  : process.env.APPDATA
    ? path.join(process.env.APPDATA, 'Forge')
    : path.join(process.cwd(), '.forge-data')
const forgeDataFile = path.join(forgeDataDir, storageFileName)
const forgeBackupFile = `${forgeDataFile}.bak`
const forgeTempFile = `${forgeDataFile}.tmp`

function readJsonFile(filePath: string): Record<string, string> | null {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, string>
  } catch {
    return null
  }
}

function readStorageRecord() {
  return readJsonFile(forgeDataFile) ?? {}
}

function writeStorageRecord(record: Record<string, string>) {
  fs.mkdirSync(forgeDataDir, { recursive: true })
  fs.writeFileSync(forgeTempFile, JSON.stringify(record, null, 2), 'utf-8')
  fs.renameSync(forgeTempFile, forgeDataFile)
  fs.copyFileSync(forgeDataFile, forgeBackupFile)
}

function readRequestBody(request: NodeJS.ReadableStream) {
  return new Promise<string>((resolve, reject) => {
    let body = ''
    request.setEncoding('utf-8')
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(value))
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    {
      name: 'forge-dev-appdata-storage',
      configureServer(server) {
        server.middlewares.use('/__forge_data__', async (request, response) => {
          try {
            const requestUrl = new URL(request.url ?? '/', 'http://localhost')
            const storageName = decodeURIComponent(requestUrl.pathname.replace(/^\/+/, ''))
            if (storageName === '__storage_url__') {
              sendJson(response, 200, { path: forgeDataFile })
              return
            }

            if (!storageName) {
              sendJson(response, 400, { error: 'missing storage name' })
              return
            }

            const record = readStorageRecord()

            if (request.method === 'GET') {
              const raw = record[storageName]
              sendJson(response, 200, raw ? JSON.parse(raw) : null)
              return
            }

            if (request.method === 'PUT') {
              const body = await readRequestBody(request)
              record[storageName] = JSON.stringify(JSON.parse(body))
              writeStorageRecord(record)
              sendJson(response, 200, { ok: true })
              return
            }

            if (request.method === 'DELETE') {
              delete record[storageName]
              writeStorageRecord(record)
              sendJson(response, 200, { ok: true })
              return
            }

            sendJson(response, 405, { error: 'method not allowed' })
          } catch (error) {
            sendJson(response, 500, {
              error: error instanceof Error ? error.message : 'storage error',
            })
          }
        })
      },
    },
  ],
  base: './',
})
