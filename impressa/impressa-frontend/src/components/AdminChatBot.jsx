import { useEffect, useRef, useState } from "react";
import api from "../utils/axiosInstance";

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
      } catch {}
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
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        💬
      </button>

      {/* Chat Panel */}
      {showChat && (
  <div className="fixed bottom-0 left-1/2 translate-x-[-50%] w-[520px] h-[560px] bg-white rounded-t-lg shadow-lg flex flex-col z-40">
    {/* Header */}
    <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>🧠</span>
        <span>impressa Assistant</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={clearChat} className="text-gray-500 hover:text-gray-700 text-xs">Clear</button>
        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-red-500 text-sm">✖</button>
      </div>
    </div>

    {/* Messages */}
    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`p-2 rounded max-w-[85%] ${
            msg.role === "user"
              ? "bg-blue-100 ml-auto text-right"
              : "bg-white border border-gray-200 shadow-sm text-left"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
            {msg.text}
          </div>
        </div>
      ))}
      {loading && (
        <div className="p-2 rounded max-w-[70%] bg-white border border-gray-200 shadow-sm text-left">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Assistant is typing…
          </div>
        </div>
      )}
    </div>

    {/* Input */}
    <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 bg-white">
      <textarea
        rows={2}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the assistant… (Enter to send, Shift+Enter for newline)"
        className="flex-1 border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        disabled={loading || !question.trim()}
        className={`px-4 py-2 rounded text-sm text-white ${loading || !question.trim() ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Thinking…" : "Send"}
      </button>
    </form>
  </div>
)}
    </>
  );
}

export default AdminChatbot;