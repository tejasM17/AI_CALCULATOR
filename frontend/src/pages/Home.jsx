// src/App.jsx or src/pages/Home.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import ClassicCalculator from '../components/Calculator/ClassicCalculator'
import AICalculatorChat from '../components/Calculator/AICalculatorChat'
import ModeToggle from '../components/common/ModeToggle'

function Home() {
  const [mode, setMode] = useState('calculator') 

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header / Mode Switch */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart AI Calc
            </h1>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {mode === 'calculator' ? (
              <ClassicCalculator />
            ) : (
              <AICalculatorChat />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home