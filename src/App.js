import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please select only PDF files");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        event.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    let userMessageText = input;
    if (selectedFile) {
      userMessageText = input
        ? `${input} (with attached PDF: ${selectedFile.name})`
        : `Uploaded PDF: ${selectedFile.name}`;
    }

    const userMessage = { sender: "user", text: userMessageText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", input);

      if (selectedFile) {
        formData.append("pdf", selectedFile);
      }

      const response = await fetch(
        "https://financechatbot-z1ct.onrender.com/api/chat",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry! there is some technical issue, Please try again",
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

        {selectedFile && (
          <div className="uploaded-details">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>📄</span>
              <span style={{ flex: 1 }}>{selectedFile.name}</span>
              <span style={{ fontSize: "12px", color: "#666" }}>
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                onClick={removeFile}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="e.g. Want to Check eligibility criteria for Loan to reach your dreams ?"
            disabled={loading}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={triggerFileInput}
            disabled={loading}
            title="Upload PDF"
            className="chat-send"
          >
            Upload
          </button>
          <button
            className="chat-send"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Ask"}
          </button>
          <button
            onClick={clearMessage}
            disabled={loading}
            className="chat-send"
          >
            {loading ? "..." : "Clear"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
