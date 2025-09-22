import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import BackgroundManager from './BackgroundManager'
import { Menu, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <BackgroundManager>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Navigation Header */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Research Flow</span>
            </div>
            <div className="w-10"></div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile
            ? `fixed top-0 left-0 z-50 h-full transition-transform duration-300 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
          }
        `}>
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          isMobile ? 'pt-16' : ''
        }`}>
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className={`h-full ${isMobile ? 'p-4' : 'p-6'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>

    </BackgroundManager>
  )
}

export default Layout