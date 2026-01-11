import { useEffect, useRef, useState } from "react";
import api from "../utils/axiosInstance";
import { FaRobot, FaPaperPlane, FaTimes, FaTrashAlt, FaCommentDots } from "react-icons/fa";

function AdminChatbot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const listRef = useRef(null);

  // Load persisted chat
  useEffect(() => {
    const saved = localStorage.getItem("adminChatMessages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch { }
    }
  }, []);

  // Persist chat and autoscroll to bottom
  useEffect(() => {
    localStorage.setItem("adminChatMessages", JSON.stringify(messages));
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, showChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post("/dashboard/chatbot", {
        question,
        messages: [...messages, userMessage],
      });
      const botMessage = { role: "assistant", text: res.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errText = err?.response?.data?.message || "Failed to get response. Please try again.";
      const errorMessage = { role: "assistant", text: errText };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("adminChatMessages");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform
          ${showChat ? 'bg-charcoal-700 text-white rotate-90 scale-0 opacity-0 absolute' : 'bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white hover:scale-110'}
        `}
        title="Toggle AI Assistant"
      >
        <FaCommentDots size={24} />
      </button>

      {/* Close Button when open - positioned relative to panel or button area */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`
           absolute bottom-0 right-0 z-10 flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-charcoal-800 text-white border border-charcoal-700 transition-all duration-300 transform
           ${showChat ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
      >
        <FaTimes size={20} />
      </button>

      {/* Chat Panel */}
      <div
        className={`
          absolute bottom-20 right-0 w-80 sm:w-96 bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border border-cream-200 dark:border-charcoal-700 overflow-hidden transition-all duration-300 origin-bottom-right
          ${showChat ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-charcoal-800 to-charcoal-900 border-b border-charcoal-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta-500/20 rounded-lg">
              <FaRobot className="text-terracotta-400" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-medium text-charcoal-400">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-charcoal-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="h-96 overflow-y-auto p-4 space-y-4 bg-cream-50 dark:bg-charcoal-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-charcoal-600"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
              <div className="w-16 h-16 bg-cream-200 dark:bg-charcoal-700 rounded-full flex items-center justify-center mb-4 text-terracotta-500">
                <FaRobot size={32} />
              </div>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 font-medium">How can I help you manage your store today?</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`
                  max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === "user"
                    ? "bg-terracotta-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-charcoal-800 text-charcoal-800 dark:text-gray-200 border border-cream-200 dark:border-charcoal-700 rounded-tl-none"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-charcoal-800 px-4 py-3 rounded-2xl rounded-tl-none border border-cream-200 dark:border-charcoal-700 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-terracotta-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-terracotta-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-terracotta-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-charcoal-800 border-t border-cream-200 dark:border-charcoal-700">
          <div className="relative flex items-center gap-2">
            <textarea
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full pl-4 pr-12 py-3 text-sm bg-cream-50 dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 outline-none resize-none text-charcoal-800 dark:text-white placeholder-charcoal-400 dark:placeholder-charcoal-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2 p-2 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 disabled:opacity-50 disabled:hover:bg-terracotta-500 transition-colors shadow-sm"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
          <p className="text-[10px] text-center text-charcoal-400 mt-2 font-medium">Press Enter to send</p>
        </form>
      </div>
    </div>
  );
}

export default AdminChatbot;