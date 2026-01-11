import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const AICalculatorChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const { refreshHistory } = useAppContext();

  /* 🔽 Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🔽 Text streaming effect */
  const streamText = (fullText) => {
    let index = 0;

    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    const interval = setInterval(() => {
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: fullText.slice(0, index),
        };
        return updated;
      });

      if (index >= fullText.length) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 18); // typing speed
  };

  /* 🔽 Send message */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      streamText(data.response);
      refreshHistory();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `⚠️ ${err.message}` },
      ]);
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    alert("🎤 Voice input coming soon!");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
      {/* 🔽 Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
              Ask me anything math-related!
            </h2>
            <p className="text-sm max-w-md">
              Try: “solve x² + 5x + 6 = 0”, “integral of sin(x)”
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            <div
              className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed tracking-wide text-[15px] md:text-base">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* 🔽 Loading dots */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-5 py-3.5 rounded-2xl rounded-bl-none">
              <div className="flex space-x-2">
                {[0, 150, 300].map((d, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🔽 Input */}
      <div className="p-4 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send)"
            rows={1}
            className="
    flex-1 resize-none
    bg-gray-100 dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    placeholder-gray-500 dark:placeholder-gray-400
    caret-blue-600 dark:caret-blue-400
    border border-gray-300 dark:border-gray-600
    rounded-xl px-5 py-3
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    transition-all
    max-h-32 overflow-y-auto
  "
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-full ${
              input.trim() && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICalculatorChat;
