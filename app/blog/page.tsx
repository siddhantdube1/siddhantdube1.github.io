'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
  tx_number: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setAllTags(data.tags || [])
      })
      .catch(err => console.error('Error fetching posts:', err))
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Grid background already on body::before from globals.css */}

      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--inert)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono-display text-xs tracking-widest transition-colors duration-150"
            style={{ color: 'var(--ink-dim)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--instrument)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-dim)')}
          >
            <ArrowLeft size={14} />
            SD-01
          </Link>
          <span className="font-mono-display text-xs tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            TRANSMISSION LOG
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="font-mono-display text-2xl md:text-3xl font-bold tracking-widest mb-1" style={{ color: 'var(--ink)' }}>
            TRANSMISSION LOG
          </h1>
          <p className="font-mono-display text-xs tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            // DISPATCHES FROM THE FIELD
          </p>
          <div className="mt-4 h-px" style={{ background: 'var(--inert)' }} />
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ink-dim)' }}
            />
            <input
              type="text"
              placeholder="SEARCH TRANSMISSIONS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 font-mono-display text-xs border rounded transition-colors duration-150 focus:outline-none"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--ink)',
                borderColor: 'var(--inert)',
              }}
              onFocus={e => ((e.currentTarget as HTMLInputElement).style.borderColor = 'var(--instrument)')}
              onBlur={e => ((e.currentTarget as HTMLInputElement).style.borderColor = 'var(--inert)')}
            />
          </div>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTag(null)}
              className="font-mono-display text-[10px] px-3 py-1 border tracking-widest transition-colors duration-150"
              style={{
                borderColor: !selectedTag ? 'var(--instrument)' : 'var(--inert)',
                color: !selectedTag ? 'var(--instrument)' : 'var(--ink-dim)',
              }}
            >
              ALL
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="font-mono-display text-[10px] px-3 py-1 border tracking-widest transition-colors duration-150"
                style={{
                  borderColor: selectedTag === tag ? 'var(--instrument)' : 'var(--inert)',
                  color: selectedTag === tag ? 'var(--instrument)' : 'var(--ink-dim)',
                }}
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Post list */}
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>
            {posts.length === 0
              ? '// NO TRANSMISSIONS YET — CHECK BACK SOON'
              : '// NO MATCHES FOR THIS QUERY'}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="border-b py-5 group"
                style={{ borderColor: 'var(--inert)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span
                    className="font-mono-display text-xs flex-shrink-0 w-16"
                    style={{ color: 'var(--instrument)' }}
                  >
                    {`TX-${String(post.tx_number).padStart(3, '0')}`}
                  </span>
                  <span
                    className="font-mono-display text-xs flex-shrink-0"
                    style={{ color: 'var(--ink-dim)' }}
                  >
                    {post.date}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-bold transition-colors duration-150"
                    style={{ color: 'var(--ink)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--instrument)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)')}
                  >
                    ▸ {post.title}
                  </Link>
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-sm leading-relaxed ml-0 sm:ml-[calc(64px+1.5rem+72px+1.5rem)]" style={{ color: 'var(--ink-dim)' }}>
                    {post.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <footer
        className="border-t py-6 px-4 text-center font-mono-display text-xs mt-12"
        style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
      >
        <Link href="/" style={{ color: 'var(--ink-dim)' }}>← SD-01</Link>
      </footer>
    </div>
  )
}
