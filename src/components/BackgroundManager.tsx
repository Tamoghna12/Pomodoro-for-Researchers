import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface BackgroundManagerProps {
  children: React.ReactNode
}

interface BackgroundTheme {
  id: string
  name: string
  type: 'gradient' | 'pattern' | 'animated'
  light: string
  dark: string
  preview: string
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ children }) => {
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)
  const [currentTheme, setCurrentTheme] = useState('forest')

  const backgroundThemes: BackgroundTheme[] = [
    {
      id: 'forest',
      name: 'Forest Sanctuary',
      type: 'animated',
      light: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
      dark: 'bg-gradient-to-br from-gray-900 via-emerald-900/20 to-green-900/20',
      preview: '🌲'
    },
    {
      id: 'meadow',
      name: 'Peaceful Meadow',
      type: 'gradient',
      light: 'bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50',
      dark: 'bg-gradient-to-br from-gray-900 via-green-900/15 to-emerald-900/15',
      preview: '🌿'
    },
    {
      id: 'sage',
      name: 'Sage Garden',
      type: 'gradient',
      light: 'bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50',
      dark: 'bg-gradient-to-br from-gray-900 via-slate-900/20 to-green-900/15',
      preview: '🍃'
    },
    {
      id: 'moss',
      name: 'Moss Stone',
      type: 'animated',
      light: 'bg-gradient-to-br from-stone-50 via-green-50 to-emerald-50',
      dark: 'bg-gradient-to-br from-gray-900 via-stone-900/20 to-green-900/20',
      preview: '🪨'
    },
    {
      id: 'minimal',
      name: 'Pure Focus',
      type: 'gradient',
      light: 'bg-gradient-to-br from-slate-50 to-gray-50',
      dark: 'bg-gradient-to-br from-gray-900 to-slate-900',
      preview: '⚪'
    },
    {
      id: 'zen',
      name: 'Zen Garden',
      type: 'animated',
      light: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      dark: 'bg-gradient-to-br from-gray-900 via-green-900/25 to-emerald-900/20',
      preview: '🧘'
    }
  ]

  const currentBg = backgroundThemes.find(theme => theme.id === currentTheme)
  const backgroundClass = darkMode ? currentBg?.dark : currentBg?.light

  // Animated background effects
  const renderAnimatedElements = () => {
    if (currentTheme === 'forest') {
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        </div>
      )
    }

    if (currentTheme === 'moss' || currentTheme === 'zen') {
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/6 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '12s' }}></div>
            <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-emerald-400/6 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
          </div>
        </div>
      )
    }

    return null
  }

  // Floating particles for certain themes
  const renderFloatingParticles = () => {
    if (currentTheme === 'zen' || currentTheme === 'forest') {
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-emerald-400/15 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 3}s`,
                animationDuration: `${12 + Math.random() * 6}s`
              }}
            ></div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClass} relative`}>
      {/* Animated background elements */}
      {renderAnimatedElements()}
      {renderFloatingParticles()}

      {/* Background overlay for better content readability */}
      <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[0.5px]"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Background theme selector - hidden by default, can be toggled */}
      <div className="fixed bottom-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-3 gap-2">
            {backgroundThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setCurrentTheme(theme.id)}
                className={`
                  w-10 h-10 rounded-lg border-2 transition-all duration-200
                  ${currentTheme === theme.id
                    ? 'border-emerald-500 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                  }
                  ${darkMode ? theme.dark : theme.light}
                  flex items-center justify-center text-lg
                `}
                title={theme.name}
              >
                {theme.preview}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default BackgroundManager