import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useMessages } from "../../hooks/useMessages";
import styles from "./VoiceChat.module.css";

export const VoiceChat = () => {
  const [message, setMessage] = useState("");
  const { messages, addMessage, isAddingMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isAddingMessage) {
      addMessage(message.trim());
      setMessage("");
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

          {isAddingMessage && (
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
              disabled={isAddingMessage}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
              value={message}
            />
            <button
              className={styles.sendButton}
              disabled={!message.trim() || isAddingMessage}
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
