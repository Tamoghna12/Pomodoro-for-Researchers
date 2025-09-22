import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'
import Layout from './components/Layout'
import ResearchWorkspace from './components/ResearchWorkspace'
import AnalyticsSection from './components/sections/AnalyticsSection'
import SettingsSection from './components/sections/SettingsSection'
import AIResearchSection from './components/sections/AIResearchSection'
import EnhancedSearchSection from './components/sections/EnhancedSearchSection'
import { useNotifications } from './hooks/useNotifications'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)
  const [activeSection, setActiveSection] = useState('workspace')

  // Initialize notifications and local storage
  useNotifications()
  useLocalStorage()

  const renderSection = () => {
    switch (activeSection) {
      case 'workspace':
        return <ResearchWorkspace />
      case 'ai-research':
        return <AIResearchSection />
      case 'search':
        return <EnhancedSearchSection />
      case 'analytics':
        return <AnalyticsSection />
      case 'settings':
        return <SettingsSection />
      default:
        return <ResearchWorkspace />
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderSection()}
      </Layout>
    </div>
  )
}

export default App