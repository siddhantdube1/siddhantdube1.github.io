'use client'

import React, { useState, useEffect } from 'react'
import { Github, Linkedin, Mail, Phone, Menu, X, ChevronDown, ExternalLink, Award, Code, Database, Cloud, Moon, Sun, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Experience {
  title: string
  company: string
  location: string
  period: string
  icon: React.ReactNode
  highlights: string[]
}

interface Skill {
  items: string[]
  icon: React.ReactNode
}

interface Project {
  icon: string
  title: string
  description: string
  tags: string[]
  gradient: string
  metrics: string
}

interface Stat {
  number: string
  label: string
  description: string
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Failed to send message. Please try again.')
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Your name"
              disabled={status === 'loading'}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
              disabled={status === 'loading'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="What would you like to discuss?"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Your message..."
            disabled={status === 'loading'}
          />
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-400">
            <CheckCircle size={20} />
            <span className="font-medium">Message sent successfully! I&apos;ll get back to you soon.</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-400">
            <AlertCircle size={20} />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${
            status === 'loading' ? 'animate-pulse' : ''
          }`}
        >
          {status === 'loading' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <Send size={20} />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Theme management
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark'
    if (stored) {
      setTheme(stored)
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Scroll management
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      const sections = ['home', 'about', 'experience', 'skills', 'projects', 'contact']
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 150 && rect.bottom >= 150
        }
        return false
      })
      if (current) setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setIsMenuOpen(false)
    }
  }

  const experiences: Experience[] = [
    {
      title: "Senior Machine Learning Engineer",
      company: "CVS Health",
      location: "Cambridge, MA",
      period: "Sep 2024 – Jan 2026",
      icon: <Award className="w-6 h-6" />,
      highlights: [
        "Delivered real-time recommendations under 200ms with FastAPI microservice integrating geospatial queries and vector embeddings from MongoDB",
        "Reduced model explainability computation by 8x using GPU-enabled DataProc clusters and parallel SHAP processing",
        "Improved feature engineering throughput by 25% using NVTabular, Dask, and NVIDIA GPUs",
        "Orchestrated data ingestion and feature table creation for high-volume healthcare datasets via Airflow and BigQuery"
      ]
    },
    {
      title: "Machine Learning Engineer",
      company: "Ikigai Labs",
      location: "Cambridge, MA",
      period: "Nov 2023 – Sep 2024",
      icon: <Code className="w-6 h-6" />,
      highlights: [
        "Boosted client operations by 15% for 100TB of data by building 6 scalable time-based algorithms with Python and Ray",
        "Improved time series accuracy by 8% with scalable change point detection algorithm",
        "Achieved 99.9% availability deploying on EKS and Anyscale using Helm and Kubernetes",
        "Enhanced predictive accuracy leveraging LLM-powered Generative AI for tabular and time series analysis"
      ]
    },
    {
      title: "Machine Learning Engineer",
      company: "Squark Inc.",
      location: "Boston, MA",
      period: "Feb 2023 – Nov 2023",
      icon: <Database className="w-6 h-6" />,
      highlights: [
        "Reduced model insight computation by 75% using NVIDIA RAPIDS and GPU parallel processing on AWS EC2",
        "Improved load balancing by 30% and decreased downtime by 20% with automated pipeline architecture",
        "Boosted system performance by 23% integrating Couchbase distributed cache"
      ]
    },
    {
      title: "ML Engineer Intern",
      company: "Empallo Inc. (MIT Startup)",
      location: "Cambridge, MA",
      period: "Jan 2022 – Aug 2022",
      icon: <Cloud className="w-6 h-6" />,
      highlights: [
        "Enhanced heart failure readmission prediction accuracy by 18% using RNNs on 1.6M+ clinical records",
        "Increased platform data capacity by 2x through data partitioning using AWS Glue, S3, and Python",
        "Semi-Finalist, MIT $100K Entrepreneurship Competition (Top 10 out of 83 teams)"
      ]
    }
  ]

  const skills: Record<string, Skill> = {
    "Machine Learning & AI": {
      items: ["TensorFlow", "PyTorch", "Keras", "Scikit-learn", "SHAP", "NVTabular", "Ray", "LLMs", "RNNs"],
      icon: <Award className="w-8 h-8" />
    },
    "Programming & Frameworks": {
      items: ["Python", "SQL", "R", "JavaScript", "Java", "FastAPI", "Airflow", "Spring Boot"],
      icon: <Code className="w-8 h-8" />
    },
    "Cloud & DevOps": {
      items: ["AWS", "GCP", "Anyscale", "Docker", "Kubernetes", "Helm", "Grafana", "Git"],
      icon: <Cloud className="w-8 h-8" />
    },
    "Data & Databases": {
      items: ["BigQuery", "MongoDB", "PostgreSQL", "MySQL", "S3", "DynamoDB", "Pandas", "Dask"],
      icon: <Database className="w-8 h-8" />
    }
  }

  const projects: Project[] = [
    {
      icon: "🎓",
      title: "PhD Research: Socio-Technical Legal AI",
      description: "Investigating how Graph Neural Networks, Large Language Models, and neuro-symbolic architectures can enhance legal reasoning while considering socio-technical dimensions and human-centered design principles.",
      tags: ["PhD Research", "Legal AI", "GNNs", "LLMs", "Neuro-Symbolic", "Socio-Technical"],
      gradient: "from-purple-500 via-indigo-600 to-blue-700",
      metrics: "Started January 2026"
    },
    {
      icon: "🏥",
      title: "Real-Time Healthcare Recommendations",
      description: "Built FastAPI microservice delivering sub-200ms recommendations using geospatial queries, vector embeddings, and GPU-accelerated feature engineering for CVS Health's provider matching system.",
      tags: ["FastAPI", "MongoDB", "GPU Computing", "Vector Embeddings", "BigQuery"],
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      metrics: "200ms response time, 25% throughput improvement"
    },
    {
      icon: "📊",
      title: "Scalable Time Series Platform",
      description: "Developed 6 production-grade algorithms handling 100TB+ data with 15% operational improvement, featuring advanced change point detection, anomaly detection, and forecasting capabilities.",
      tags: ["Python", "Ray", "Kubernetes", "AWS", "Anyscale"],
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      metrics: "100TB data processed, 99.9% uptime"
    },
    {
      icon: "🧠",
      title: "Heart Failure Prediction System",
      description: "Enhanced readmission prediction accuracy by 18% using custom RNN architecture with novel feature engineering on 1.6M+ clinical records. Semi-finalist in MIT $100K Entrepreneurship Competition.",
      tags: ["RNN", "Healthcare AI", "AWS", "Deep Learning", "Feature Engineering"],
      gradient: "from-cyan-500 via-blue-600 to-blue-700",
      metrics: "1.6M+ records, 18% accuracy improvement"
    },
    {
      icon: "⚡",
      title: "GPU-Accelerated ML Pipeline",
      description: "Reduced model computation time by 75% using NVIDIA RAPIDS for parallel processing, enabling real-time insights for enterprise SaaS platform serving millions of users.",
      tags: ["NVIDIA RAPIDS", "GPU Computing", "AWS EC2", "Performance Optimization"],
      gradient: "from-orange-500 via-red-600 to-pink-600",
      metrics: "75% computation reduction"
    },
    {
      icon: "🎓",
      title: "DAESO Hackathon 2022 - Director",
      description: "Led as Hackathon Director at Northeastern University, attracting 60+ participants across 17 teams. Organized industry seminars and created engaging ML/data science challenges for graduate students.",
      tags: ["Leadership", "Event Management", "Community Building", "Education"],
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      metrics: "60+ participants, 17 teams"
    },
  ]

  const stats: Stat[] = [
  { number: "6+", label: "Years Experience", description: "In ML & Software Engineering" },
  { number: "2025", label: "PhD Started", description: "Legal AI Research" },
  { number: "3", label: "Research Areas", description: "GNNs, LLMs, Neuro-Symbolic" },
  { number: "100TB+", label: "Data Processed", description: "In Previous Roles" }
]

  const navLinks = ['About', 'Experience', 'Skills', 'Projects', 'Contact', 'Blog']

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => scrollToSection('home')}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Siddhant Dube
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((item) => (
                item === 'Blog' ? (
                  <a
                    key={item}
                    href="/blog"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    {item}
                  </a>
                ) : (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-sm font-semibold transition-all ${
                      activeSection === item.toLowerCase()
                        ? 'text-blue-600 dark:text-blue-400 scale-110'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {item}
                  </button>
                )
              ))}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((item) => (
                item === 'Blog' ? (
                  <a
                    key={item}
                    href="/blog"
                    className="block w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {item}
                  </a>
                ) : (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeSection === item.toLowerCase()
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
            <div className="inline-block">
              <div className="w-28 h-28 md:w-36 md:h-36 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-5xl md:text-7xl shadow-2xl animate-bounce border-4 border-white">
                👨‍💻
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Siddhant Dube
              </h1>
              <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                PhD Candidate & AI/ML Researcher
              </p>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                <span className="font-semibold text-purple-600 dark:text-purple-400">PhD Candidate in Legal AI</span> | 
                Researching socio-technical AI systems, GNNs, LLMs & neuro-symbolic architectures | 
                Former Senior ML Engineer at CVS Health
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                Get In Touch
              </button>
              <a
                href="https://github.com/imsid22"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all inline-flex items-center justify-center gap-2"
              >
                <Github size={20} />
                View GitHub
              </a>
            </div>

            <button
              onClick={() => scrollToSection('about')}
              className="mt-12 inline-block animate-bounce"
              aria-label="Scroll to about section"
            >
              <ChevronDown size={36} className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-12 md:mb-20 text-gray-900 dark:text-white">
            About Me
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div className="space-y-6 text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
              <p className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                I&apos;m a PhD student researching Legal AI with a focus on socio-technical systems, where I explore how Graph Neural Networks, Large Language Models, and neuro-symbolic architectures can transform legal reasoning and decision-making.
              </p>
              <p>
                With a <span className="font-semibold text-gray-800 dark:text-gray-200">Master&apos;s in Data Analytics Engineering from Northeastern University</span> and extensive experience across healthcare, enterprise SaaS, and analytics platforms, I specialize in building scalable ML systems using cutting-edge technologies like GPU-accelerated computing, distributed systems, and modern cloud architectures.
              </p>
              <p>
                My research combines technical AI innovation with socio-technical perspectives, examining how <span className="font-semibold text-blue-600 dark:text-blue-400">GNNs, LLMs, and neuro-symbolic architectures</span> can address complex legal challenges while considering their broader societal impacts and human-centered design.
              </p>
              <p>
                Before starting my PhD in January 2026, I was a Senior ML Engineer at CVS Health, where I built production AI systems. I&apos;ve also led hackathons, mentored 100+ students, and contributed to MIT-backed startups, always seeking to make AI more impactful and accessible.
              </p>

              <div className="pt-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Education</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Northeastern University</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">M.S. Data Analytics Engineering (GPA: 3.76/4.00)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Boston, MA | 2021 - 2022</p>
                  </div>
                  <div className="border-l-4 border-purple-600 dark:border-purple-400 pl-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Monash University</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">B.Eng. Software Engineering (First Class Honours)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Kuala Lumpur, Malaysia | 2017 - 2020</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white text-center transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  <div className="text-3xl md:text-5xl font-extrabold mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base font-bold opacity-95 mb-1">{stat.label}</div>
                  <div className="text-xs opacity-80">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-12 md:mb-20 text-gray-900 dark:text-white">
            Professional Experience
          </h2>
          
          <div className="space-y-6 md:space-y-8">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white flex-shrink-0">
                      {exp.icon}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {exp.title}
                      </h3>
                      <p className="text-lg md:text-xl text-blue-600 dark:text-blue-400 font-bold">
                        {exp.company}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exp.location}</p>
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                    {exp.period}
                  </div>
                </div>
                
                <ul className="space-y-3 mt-6">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start group">
                      <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 text-lg font-bold group-hover:scale-125 transition-transform">▸</span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-12 md:mb-20 text-gray-900 dark:text-white">
            Technical Expertise
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Object.entries(skills).map(([category, { items, icon }], index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                    {icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    {category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs md:text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-12 md:mb-20 text-gray-900 dark:text-white">
            Featured Projects
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700"
              >
                <div className={`h-48 md:h-56 bg-gradient-to-br ${project.gradient} flex items-center justify-center text-6xl md:text-8xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                  {project.icon}
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm md:text-base">
                    {project.description}
                  </p>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-400">{project.metrics}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-gray-900 dark:text-white text-center">
            Let&apos;s Connect
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto text-center">
            I&apos;m always interested in discussing ML engineering, AI research, collaborations, or new opportunities. 
            Feel free to reach out!
          </p>

          {/* Contact Form */}
          <ContactForm />

          {/* Divider */}
          <div className="my-12 flex items-center">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">or reach out directly</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          
          {/* Contact Links */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <a
              href="mailto:siddhantdube1@gmail.com"
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <Mail size={22} />
              <span>Email</span>
            </a>
            <a
              href="https://linkedin.com/in/siddhantdube"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <Linkedin size={22} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/siddhantdube1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold hover:from-gray-900 hover:to-black hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <Github size={22} />
              <span>GitHub</span>
            </a>
            <a
              href="tel:+601159402122"
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <Phone size={22} />
              <span>Call</span>
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">Download my resume or view my latest work</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all inline-flex items-center justify-center gap-2">
                <ExternalLink size={18} />
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">Siddhant Dube</p>
            <p className="text-gray-400 text-sm">
              AI/ML Researcher | PhD Candidate
            </p>
            <div className="flex justify-center gap-6 pt-4">
              <a href="https://github.com/imsid22" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://linkedin.com/in/siddhantdube" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="mailto:siddhantdube1@gmail.com" className="hover:text-blue-400 transition-colors">
                <Mail size={24} />
              </a>
            </div>
            <p className="text-gray-500 text-sm pt-6">
              © 2025 Siddhant Dube. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}