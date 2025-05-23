import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Markets from './pages/Markets'
import Documentation from './pages/Documentation'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/documentation',
    element: <Documentation />,
  },
  {
    path: '/bots',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: '/markets',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Markets />,
      },
    ],
  },
  {
    path: '/trade',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Trading />,
      },
    ],
  },
  {
    path: '/token',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: '/ai',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
