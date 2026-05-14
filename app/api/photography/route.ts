import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const revalidate = 3600

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'photography', 'index.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const photos = JSON.parse(raw)
    return NextResponse.json(photos)
  } catch {
    return NextResponse.json([])
  }
}
