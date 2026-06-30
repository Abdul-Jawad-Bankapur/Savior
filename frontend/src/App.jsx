import { useState, useCallback, Suspense } from 'react'
import { useLenis } from './hooks/useLenis'
import { useWebSocket } from './hooks/useWebSocket'
import Navigation from './components/layout/Navigation'
import HeroSection from './components/scenes/HeroSection'
import LiveDemoSection from './components/scenes/LiveDemoSection'
import ArchitectureSection from './components/scenes/ArchitectureSection'
import HowItWorksSection from './components/scenes/HowItWorksSection'
import ResultsSection from './components/scenes/ResultsSection'
import TeamFooter from './components/layout/TeamFooter'

function App() {
  useLenis()

  const wsUrl = import.meta.env.VITE_WS_URL || null
  const { liveTranscript, isConnected } = useWebSocket(wsUrl)

  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <LiveDemoSection
          liveTranscript={liveTranscript}
          isConnected={isConnected}
        />
        <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
          <ArchitectureSection />
        </Suspense>
        <HowItWorksSection />
        <ResultsSection />
        <TeamFooter />
      </main>
    </>
  )
}

export default App
