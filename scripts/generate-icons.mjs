import sharp from 'sharp'
import fs from 'fs'

const svg = fs.readFileSync('public/favicon.svg')

async function main() {
  await sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png')
  await sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png')
  console.log('✅ Icons generated: pwa-192x192.png, pwa-512x512.png')
}

main().catch(console.error)
