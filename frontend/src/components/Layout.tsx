import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Navigation />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
