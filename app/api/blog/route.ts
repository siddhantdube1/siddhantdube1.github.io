import { NextResponse } from 'next/server'
import { getSortedPostsData, getAllTags } from '@/lib/blog'

export async function GET() {
  try {
    const posts = getSortedPostsData()
    const tags = getAllTags()
    
    return NextResponse.json({ posts, tags })
  } catch (error) {
    return NextResponse.json({ posts: [], tags: [] })
  }
}