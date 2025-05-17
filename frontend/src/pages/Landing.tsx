
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CircleStackIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Blockchain Powered Trading',
    description: 'Advanced algorithms analyze market patterns and execute trades with precision.',
    icon: CpuChipIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Monitor your portfolio performance with live market data from Pyth Network.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure & Decentralized',
    description: 'Built on Sui blockchain for maximum security and transparency.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Automated Strategies',
    description: 'Create and deploy custom trading bots with no coding required.',
    icon: RocketLaunchIcon,
  },
]

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const updateCanvasSize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      
      updateCanvasSize()

      const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      })
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

      animate()

      const handleResize = () => {
        updateCanvasSize()
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }

    setupCanvas(canvas, ctx)
  }, [])
  return (
    <div className="relative h-screen text-white overflow-hidden flex flex-col justify-center items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background animate-gradient bg-gradient-size">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      </div>
      {/* Hero Section */}
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
          Trade Smarter and Secure with Blockchain and AI-Powered Forex Analysis
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        Experience the future of forex trading with on-chain automation and real-time price feeds powered by Pyth.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <CpuChipIcon className="h-5 w-5 mr-2" />
            Get Started
          </Link>
          <Link
            to="/documentation"
            className="btn-secondary inline-flex items-center"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Documentation
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-background-lighter backdrop-blur-lg rounded-full px-8 py-4 shadow-glow">
        <ul className="flex items-center space-x-12">
          <li>
            <Link to="/bots" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
              <CpuChipIcon className="h-6 w-6" />
              <span className="text-sm mt-1">Bots</span>
            </Link>
          </li>
          <li>
            <Link to="/markets" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
              <ChartBarIcon className="h-6 w-6" />
              <span className="text-sm mt-1">Markets</span>
            </Link>
          </li>
          <li>
            <Link to="/trade" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
              <ArrowTrendingUpIcon className="h-6 w-6" />
              <span className="text-sm mt-1">Trade</span>
            </Link>
          </li>
          <li>
            <Link to="/token" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
              <CircleStackIcon className="h-6 w-6" />
              <span className="text-sm mt-1">Token</span>
            </Link>
          </li>
          <li>
            <Link to="/ai" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
              <CurrencyDollarIcon className="h-6 w-6" />
              <span className="text-sm mt-1">AI Assistant</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
