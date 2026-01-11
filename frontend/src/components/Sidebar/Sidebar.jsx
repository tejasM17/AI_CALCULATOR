// src/components/Sidebar/Sidebar.jsx
import { useState } from 'react';
import CalcHistory from './CalcHistory';
import ChatHistory from './ChatHistory';
import { Menu, X } from 'lucide-react'; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);  

  return (
    <>
      {/* Toggle Button - visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
          border-r border-gray-200 dark:border-gray-800 
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg flex flex-col h-screen overflow-hidden
        `}
      >
        <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            History
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
          <CalcHistory />
          <div className="my-4 border-t dark:border-gray-800" />
          <ChatHistory />
        </div>
      </aside>

      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;