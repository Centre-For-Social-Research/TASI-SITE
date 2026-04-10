"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm the TASI Chatbot. Ask me anything about the conference — schedule, speakers, registration, or venue.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const dismissChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsDismissed(true);
  };

  const restoreChat = () => setIsDismissed(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isDismissed) {
    return <DismissedButton onRestore={restoreChat} />;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <div
        className={`w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-semibold">TASI Chatbot</h3>
          <button
            onClick={toggleChat}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close chat window"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 text-sm ${
                  message.role === "user"
                    ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Button + Dismiss */}
      <div className={`flex items-center gap-2 ${isOpen ? "hidden" : ""}`}>
        {/* Dismiss button */}
        <button
          onClick={dismissChat}
          className="w-7 h-7 bg-white text-gray-500 rounded-full flex items-center justify-center shadow border border-gray-200 hover:text-gray-800 hover:border-gray-400 transition-colors"
          aria-label="Dismiss chatbot"
          title="Remove chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Main chat button */}
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Open TASI Chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function DismissedButton({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onRestore}
        className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
        aria-label="Restore TASI Chatbot"
      >
        Show TASI Chatbot
      </button>
    </div>
  );
}
