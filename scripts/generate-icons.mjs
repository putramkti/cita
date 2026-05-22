// Disposable script — generate raster icon set from public/favicon.svg.
// Outputs: apple-touch-icon.png (180), icon-192.png, icon-512.png.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const svgPath = resolve(root, "public/favicon.svg")
const svg = readFileSync(svgPath)

const targets = [
  { size: 180, out: "public/apple-touch-icon.png" },
  { size: 192, out: "public/icon-192.png" },
  { size: 512, out: "public/icon-512.png" },
]

for (const t of targets) {
  const outPath = resolve(root, t.out)
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size, { fit: "contain", background: { r: 248, g: 249, b: 250, alpha: 1 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outPath)
  console.log(`✓ wrote ${t.out} (${t.size}x${t.size})`)
}
