import React from 'react'


const ModeToggle = ({ mode, setMode }) => {
  return (
    <div className="inline-flex rounded-full bg-gray-200 dark:bg-gray-800 p-1">
      <button
        onClick={() => setMode('calculator')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
          mode === 'calculator'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Calculator
      </button>
      <button
        onClick={() => setMode('chat')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
          mode === 'chat'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        AI Chat
      </button>
    </div>
  )
}

export default ModeToggle;