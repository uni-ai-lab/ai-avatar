import { useState } from "react";
import styles from "./VoiceChat.module.css";

export const VoiceChat = () => {
  const [message, setMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, _setMessages] = useState([
    {
      id: 1,
      text: "こんにちはなのだ！何でも聞いてほしいのだ！",
      sender: "zundamon",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.sender === "zundamon"
                  ? styles.zundamonMessage
                  : styles.userMessage
              }`}
            >
              <div className={styles.messageContent}>{msg.text}</div>
            </div>
          ))}
        </div>

        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ずんだもんにメッセージを送るのだ..."
              className={styles.messageInput}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!message.trim()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
