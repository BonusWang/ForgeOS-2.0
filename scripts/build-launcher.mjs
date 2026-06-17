// Builds a single-file Forge-OS launcher exe:
//   vite build → copy dist/* into launcher/web → go build (embeds web) → release/Forge-OS.exe
//
// Result is one ~10MB exe that serves the frontend on a loopback port,
// persists data to %APPDATA%/Forge/forge-data.json, and opens the default
// browser. No Node, no Chromium — the frontend already supports this shape
// via platformStorage's localhost branch.
import { execSync } from 'node:child_process'
import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const launcherDir = path.join(root, 'launcher')
const webDir = path.join(launcherDir, 'web')
const distDir = path.join(root, 'dist')
const releaseDir = path.join(root, 'release')
const exeName = process.platform === 'win32' ? 'Forge-OS.exe' : 'Forge-OS'

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts })
}

async function main() {
  // 1. Build the frontend (tsc -b && vite build) → dist/
  run('npm run build')

  if (!existsSync(distDir)) {
    throw new Error('vite build did not produce dist/')
  }

  // 2. Sync dist → launcher/web (clean first so stale assets don't linger)
  await rm(webDir, { recursive: true, force: true })
  await mkdir(webDir, { recursive: true })
  await cp(distDir, webDir, { recursive: true })
  console.log('copied dist → launcher/web')

  // 3. go build with embedded web → release/Forge-OS.exe
  //    -s -w strips the symbol table and DWARF info for a smaller binary.
  await mkdir(releaseDir, { recursive: true })
  const outPath = path.join(releaseDir, exeName)
  run(`go build -ldflags "-s -w" -o "${outPath}" .`, { cwd: launcherDir })

  // 4. Report size
  const s = await stat(outPath)
  console.log(`\n✓ Built ${path.relative(root, outPath)} (${(s.size / 1024 / 1024).toFixed(1)} MB)`)
  console.log(`  Run it: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
