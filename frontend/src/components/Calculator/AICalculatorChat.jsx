import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Copy, Check } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import styled from "styled-components";

// Styled component for streaming animation (scoped, no global CSS needed)
const StreamingText = styled.p`
  overflow: hidden;
  border-right: 3px solid #60a5fa; /* blinking cursor */
  white-space: pre-wrap;
  display: inline-block;
  animation: typing 3.5s steps(40, end) infinite, blink-caret 0.75s step-end infinite;

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: #60a5fa; }
  }
`;

const AICalculatorChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [streamingMsgId, setStreamingMsgId] = useState(null); // Track which message is streaming

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { refreshHistory } = useAppContext();

  // Auto-scroll + auto-resize textarea
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [messages, input]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMsg = { id: Date.now(), role: 'user', content: input.trim(), timestamp: new Date() };
  setMessages(prev => [...prev, userMsg]);
  setInput('');
  setIsLoading(true);

  const tempAiId = Date.now() + 1;
  setStreamingMsgId(tempAiId);

  setMessages(prev => [...prev, { id: tempAiId, role: 'ai', content: '', timestamp: new Date() }]);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.chunk) {
              full += parsed.chunk;
              setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last && last.id === tempAiId) last.content = full;
                return newMsgs;
              });
            }

            if (parsed.done) {
              refreshHistory();
            }

            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            console.error('Stream parse error:', e);
          }
        }
      }
    }
  } catch (err) {
    console.error('Chat error:', err);
    setMessages(prev => {
      const newMsgs = [...prev];
      const last = newMsgs[newMsgs.length - 1];
      if (last && last.id === tempAiId) last.content = `Error: ${err.message}`;
      return newMsgs;
    });
  } finally {
    setIsLoading(false);
    setStreamingMsgId(null);
  }
};

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    alert("Voice input coming soon! (Web Speech API)");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-to-b from-white/60 to-gray-50/60 dark:from-gray-950/60 dark:to-gray-900/60 rounded-2xl backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/40 shadow-xl overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-8 animate-pulse-slow">
              <Send className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Your AI Math Tutor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg text-lg leading-relaxed">
              Ask anything — solve equations, explain concepts, derive formulas...
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex group animate-fade-in-up ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  relative max-w-[85%] md:max-w-[78%] px-6 py-4 rounded-2xl shadow-md transition-all duration-300
                  ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                  }
                `}
              >
                {isLoading && streamingMsgId && msg.id === streamingMsgId ? (
                  <StreamingText className="whitespace-pre-wrap leading-relaxed text-[15px] pr-12">
                    {msg.content}
                  </StreamingText>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px] pr-12">
                    {msg.content}
                  </p>
                )}

                {/* Timestamp + Copy */}
                <div className="absolute bottom-2 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                    title="Copy"
                  >
                    {copiedId === msg.id ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && !streamingMsgId && (
          <div className="flex justify-start">
            <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-4 rounded-2xl rounded-bl-none shadow-md border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span className="text-sm">Thinking</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "180ms" }} />
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "360ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl">
        <div className="flex items-end gap-4 max-w-4xl mx-auto">
          {/* Mic */}
          <button
            onClick={toggleRecording}
            className={`
              p-4 rounded-full transition-all duration-300 flex-shrink-0 shadow-sm
              ${isRecording
                ? "bg-red-500 text-white shadow-red-500/30 scale-110 ring-4 ring-red-500/20"
                : "bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600"
              }
            `}
          >
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything math-related... (Shift + Enter for new line)"
            rows={1}
            className="
              flex-1 resize-none bg-white/90 dark:bg-gray-800/90
              border border-gray-300/70 dark:border-gray-600/70
              rounded-2xl px-6 py-4 text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
              transition-all duration-300 shadow-inner max-h-40 overflow-y-auto
            "
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`
              p-4 rounded-full flex-shrink-0 transition-all duration-300 shadow-md
              ${input.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-600/40 hover:scale-105 active:scale-95"
                : "bg-gray-300/70 dark:bg-gray-700/70 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICalculatorChat;