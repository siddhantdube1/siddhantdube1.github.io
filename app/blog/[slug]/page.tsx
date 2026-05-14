'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Share2 } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  content: string
  readTime: string
  author: string
  tx_number: number
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetch(`/api/blog/${slug}`)
        .then(res => res.json())
        .then(data => { setPost(data); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [slug])

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href })
        .catch(e => { if (e.name !== 'AbortError') console.error(e) })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono-display text-xs" style={{ background: 'var(--bg)', color: 'var(--ink-dim)' }}>
        <p>ACQUIRING SIGNAL<span className="blink">_</span></p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-mono-display text-xs" style={{ background: 'var(--bg)', color: 'var(--ink-dim)' }}>
        <p>SIGNAL LOST — TRANSMISSION NOT FOUND</p>
        <Link href="/blog" style={{ color: 'var(--instrument)' }}>← RETURN TO LOG</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--inert)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 font-mono-display text-xs tracking-widest transition-colors duration-150"
            style={{ color: 'var(--ink-dim)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--instrument)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-dim)')}
          >
            <ArrowLeft size={14} />
            TRANSMISSION LOG
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Transmission header block */}
        <header className="mb-10 border-b pb-8" style={{ borderColor: 'var(--inert)' }}>
          <div className="font-mono-display text-xs space-y-1 mb-6">
            <p><span style={{ color: 'var(--ink-dim)' }}>TRANSMISSION  </span><span style={{ color: 'var(--instrument)' }}>{`TX-${String(post.tx_number).padStart(3, '0')}`}</span></p>
            <p><span style={{ color: 'var(--ink-dim)' }}>ORIGIN        </span>KUALA LUMPUR</p>
            <p><span style={{ color: 'var(--ink-dim)' }}>TIMESTAMP     </span>{post.date}</p>
            <p><span style={{ color: 'var(--ink-dim)' }}>SUBJECT       </span>{post.title}</p>
            <p><span style={{ color: 'var(--ink-dim)' }}>READ TIME     </span>{post.readTime}</p>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--ink)' }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="font-mono-display text-[10px] px-2 py-0.5 border"
                style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
              >
                {tag.toUpperCase()}
              </span>
            ))}
            <button
              onClick={sharePost}
              className="flex items-center gap-1 font-mono-display text-xs transition-colors duration-150"
              style={{ color: 'var(--ink-dim)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--instrument)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-dim)')}
            >
              <Share2 size={12} />
              RELAY
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="prose-mission">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Author */}
        <div className="mt-12 pt-8 border-t flex items-center gap-4" style={{ borderColor: 'var(--inert)' }}>
          <img
            src="/Profile.jpg"
            alt="Siddhant Dube"
            width={48} height={48}
            className="rounded-sm"
            style={{ filter: 'grayscale(20%)' }}
          />
          <div className="font-mono-display text-xs space-y-0.5">
            <p style={{ color: 'var(--ink)' }}>SIDDHANT DUBE</p>
            <p style={{ color: 'var(--ink-dim)' }}>OPERATOR SD-01 · PhD RESEARCHER</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="font-mono-display text-xs border px-6 py-2 tracking-widest transition-colors duration-150 inline-block"
            style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--instrument)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--instrument)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--inert)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-dim)' }}
          >
            ← RETURN TO LOG
          </Link>
        </div>
      </article>
    </div>
  )
}
