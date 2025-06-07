import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import styles from "./VoiceChat.module.css";

export const VoiceChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "こんにちはなのだ！何でも聞いてほしいのだ！",
      sender: "zundamon",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendVoiceChat = async (message: string) => {
    try {
      const response = await fetch(
        "http://localhost:8787/api/zundamon/voice-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      return data.zundamonResponse;
    } catch (error) {
      console.error("API Error:", error);
      // フォールバック用のデフォルトレスポンス
      return "ごめんなのだ〜、ちょっと調子が悪いのだ...";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = {
        id: Date.now(),
        text: message.trim(),
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      try {
        const zundamonResponseText = await sendVoiceChat(userMessage.text);

        const zundamonMessage = {
          id: Date.now() + 1,
          text: zundamonResponseText,
          sender: "zundamon",
        };
        setMessages((prev) => [...prev, zundamonMessage]);
        setIsTyping(false);
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        const zundamonMessage = {
          id: Date.now() + 1,
          text: "ごめんなのだ〜、ちょっと調子が悪いのだ...",
          sender: "zundamon",
        };
        setMessages((prev) => [...prev, zundamonMessage]);
        setIsTyping(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              className={`${styles.message} ${
                msg.sender === "zundamon"
                  ? styles.zundamonMessage
                  : styles.userMessage
              }`}
              key={msg.id}
            >
              <div className={styles.messageContent}>{msg.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.zundamonMessage}`}>
              <div
                className={`${styles.messageContent} ${styles.typingIndicator}`}
              >
                <span className={styles.typingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                入力中なのだ...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <input
              className={styles.messageInput}
              disabled={isTyping}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
              value={message}
            />
            <button
              className={styles.sendButton}
              disabled={!message.trim() || isTyping}
              type="submit"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
