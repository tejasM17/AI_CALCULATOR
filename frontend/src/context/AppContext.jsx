import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [calcHistory, setCalcHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        // Add Authorization if you implement JWT later:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      };

      const [calcRes, chatRes] = await Promise.all([
        fetch("/api/history/calcs", { headers }),
        fetch("/api/history/chats", { headers }),
      ]);

      if (!calcRes.ok) throw new Error(`Calcs fetch failed: ${calcRes.status}`);
      if (!chatRes.ok) throw new Error(`Chats fetch failed: ${chatRes.status}`);

      const calcData = await calcRes.json();
      const chatData = await chatRes.json();

      setCalcHistory(Array.isArray(calcData) ? calcData : calcData.data || []);
      setChatHistory(Array.isArray(chatData) ? chatData : chatData.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError("Could not load history. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refreshHistory = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToCalcHistory = (newCalc) => {
    setCalcHistory((prev) => [newCalc, ...prev]);
  };

  const addToChatHistory = (newChat) => {
    setChatHistory((prev) => [newChat, ...prev]);
  };

  const value = {
    calcHistory,
    chatHistory,
    loading,
    error,
    refreshHistory,
    addToCalcHistory,
    addToChatHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
