import { useEffect, useRef, useState } from "react";
import api from "../utils/axiosInstance";
import { FaRobot, FaPaperPlane, FaTimes, FaTrashAlt, FaCommentDots } from "react-icons/fa";
import "../styles/Chatbot.css";

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
    <div className="chatbot-wrapper">
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`chatbot-trigger ${showChat ? 'open' : 'closed'}`}
        title="Toggle AI Assistant"
      >
        {showChat ? <FaTimes className="trigger-icon" /> : <FaCommentDots className="trigger-icon" />}
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${showChat ? 'visible' : 'hidden'}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="robot-icon-wrapper">
              <FaRobot size={20} />
            </div>
            <div className="chat-title">
              <p>AI Assistant</p>
              <div className="chat-status">
                <span className="status-dot"></span> Online
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="clear-btn" title="Clear Chat">
            <FaTrashAlt size={14} />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaRobot />
              </div>
              <p>How can I help you today?</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role === "user" ? "user" : "bot"}`}>
              <div className={`message-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row bot">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="chat-input-area">
          <div className="input-wrapper">
            <textarea
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="chat-textarea"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="send-btn"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
          <p className="input-hint">Press Enter to send</p>
        </form>
      </div>
    </div>
  );
}

export default AdminChatbot;