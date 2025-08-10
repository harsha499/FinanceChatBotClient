import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);
  const clearMessage = () => {
    localStorage.setItem("chatMessages", JSON.stringify([]));
    setMessages((prev) => []);
  };
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post(
        "https://financechatbot-z1ct.onrender.com/api/chat",
        {
          message: input,
        },
        {
          timeout: 5000, // Timeout in milliseconds (5 seconds)
        }
      );
      const botMessage = { sender: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry! there is some technical issue, Please try again" },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="app-wrapper">
      <div className="chat-container">
        <h1 className="chat-header">
          Personal/Home Loan Detailed Terms & Conditions
        </h1>
        <h2 className="chat-subheader">
          Get To Know Essential eligibility criteria and Complete eligibility
          requirements
        </h2>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${
                msg.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="bot-message loading-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="e.g. Want to Check eligibility criteria for Loan to reach your dreams ?"
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Ask"}
          </button>
          <button
            className="chat-send"
            onClick={clearMessage}
            disabled={loading}
          >
            {loading ? "..." : "clear"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
