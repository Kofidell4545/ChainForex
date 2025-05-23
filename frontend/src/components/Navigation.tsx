import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  RocketLaunchIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Trade Bots', to: '/bots', icon: RocketLaunchIcon },
  { name: 'Markets', to: '/markets', icon: ChartBarIcon },
  { name: 'Trade', to: '/trade', icon: ArrowsRightLeftIcon },
  { name: 'Learn', to: '/documentation', icon: BookOpenIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
]

type NavigationProps = {
  mobile?: boolean
}

export default function Navigation({ mobile = false }: NavigationProps) {
  const baseClasses = mobile
    ? 'flex items-center w-full px-4 py-2 text-gray-400 hover:text-primary hover:bg-background-lighter transition-colors'
    : 'flex items-center px-3 py-2 text-gray-400 hover:text-primary transition-colors'

  const activeClasses = mobile
    ? 'flex items-center w-full px-4 py-2 text-primary bg-background-lighter'
    : 'flex items-center px-3 py-2 text-primary'

  return (
    <div 
      className={mobile 
        ? 'space-y-1 py-3' 
        : 'hidden sm:flex sm:items-center sm:space-x-1'
      }
    >
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            isActive ? activeClasses : baseClasses
          }
        >
          <item.icon
            className="h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />
          <span className={mobile ? 'ml-3' : 'ml-2'}>{item.name}</span>
        </NavLink>
      ))}
    </div>
  )
}
