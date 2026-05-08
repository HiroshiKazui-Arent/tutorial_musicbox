import fs from 'fs'
import path from 'path'

export default async function globalSetup() {
  const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures')
  fs.mkdirSync(fixturesDir, { recursive: true })

  // Minimal valid WAV file (44 bytes, 0 samples of silence)
  const wav = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00, // chunk size (36)
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // sub-chunk size (16)
    0x01, 0x00,             // PCM format
    0x01, 0x00,             // mono
    0x44, 0xAC, 0x00, 0x00, // 44100 Hz
    0x88, 0x58, 0x01, 0x00, // byte rate
    0x02, 0x00,             // block align
    0x10, 0x00,             // 16 bits per sample
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00, // data size (0)
  ])
  fs.writeFileSync(path.join(fixturesDir, 'test-audio.wav'), wav)

  // Minimal valid 1x1 white JPEG
  const jpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDB' +
    'kSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAR' +
    'CAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA' +
    'AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAA' +
    'AAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k=',
    'base64'
  )
  fs.writeFileSync(path.join(fixturesDir, 'test-image.jpg'), jpeg)
}
