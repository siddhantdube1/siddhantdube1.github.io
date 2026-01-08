'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  content: string
  readTime: string
  author: string
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
        .then(data => {
          setPost(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching post:', err)
          setLoading(false)
        })
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch((error) => {
        // Ignore AbortError (user cancelled share)
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Post Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
            <span className="flex items-center gap-2">
              <Calendar size={18} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={18} />
              {post.readTime}
            </span>
            <button
              onClick={sharePost}
              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold"
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert prose-blue max-w-none
                        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:mt-8 prose-headings:mb-4
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                        prose-ul:my-6 prose-ul:space-y-2
                        prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
                        prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-6
                        prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:my-6
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                        prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              👨‍💻
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 dark:text-white">{post.author}</p>
              <p className="text-gray-600 dark:text-gray-400">AI/ML Researcher</p>
            </div>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg"
          >
            <ArrowLeft size={20} />
            Back to All Posts
          </Link>
        </div>
      </article>
    </div>
  )
}