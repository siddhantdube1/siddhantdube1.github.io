import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  content: string
  readTime: string
  author: string
  coverImage?: string
  tx_number: number
}

export function getSortedPostsData(): BlogPost[] {
  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Calculate read time (rough estimate: 200 words per minute)
      const words = content.trim().split(/\s+/).length
      const readTime = Math.ceil(words / 200)

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        content,
        readTime: `${readTime} min read`,
        author: data.author || 'Siddhant Dube',
        coverImage: data.coverImage,
        tx_number: 0, // assigned below after ascending sort
      } as BlogPost
    })

  // Assign stable tx_number: oldest post = 1, next oldest = 2, …
  // Sort ascending by date first so the number is date-order stable.
  allPostsData.sort((a, b) => (a.date < b.date ? -1 : 1))
  allPostsData.forEach((post, i) => { post.tx_number = i + 1 })

  // Return newest-first for display.
  return allPostsData.reverse()
}

export function getPostBySlug(slug: string): BlogPost | null {
  // Use getSortedPostsData so tx_number is already assigned correctly.
  const all = getSortedPostsData()
  const found = all.find(p => p.slug === slug)
  if (found) return found

  // Fallback: slug exists on disk but wasn't indexed (shouldn't happen).
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const words = content.trim().split(/\s+/).length
    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      content,
      readTime: `${Math.ceil(words / 200)} min read`,
      author: data.author || 'Siddhant Dube',
      coverImage: data.coverImage,
      tx_number: 0,
    }
  } catch {
    return null
  }
}

export function getAllTags(): string[] {
  const posts = getSortedPostsData()
  const tags = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}