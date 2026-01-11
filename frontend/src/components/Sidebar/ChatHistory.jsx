import { useAppContext } from '../../context/AppContext';
import { MessageSquare, Loader2 } from 'lucide-react';

const ChatHistory = () => {
  const { chatHistory, loading, error, refreshHistory } = useAppContext();

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 dark:text-red-400 text-center">
        {error}
        <button
          onClick={refreshHistory}
          className="mt-3 block mx-auto px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageSquare size={20} />
          AI Chats
        </h3>
        <button
          onClick={refreshHistory}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          title="Refresh chats"
        >
          Refresh
        </button>
      </div>

      {chatHistory.length === 0 ? (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No chats yet</p>
          <p className="text-xs mt-1">Start chatting in AI mode!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {chatHistory.map((chat) => (
            <li
              key={chat._id}
              className="group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700"
              onClick={() => {
                // TODO: Load full chat into AICalculatorChat when clicked
                console.log('Open chat:', chat._id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[220px]">
                  {chat.title || 'Untitled Chat'}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(chat.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Preview of first user message */}
              {chat.messages.length > 0 && chat.messages[0].role === 'user' && (
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {chat.messages[0].content}
                </p>
              )}

              {/* Message count badge */}
              <div className="mt-2 inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-500 dark:text-gray-400">
                {chat.messages.length} messages
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;