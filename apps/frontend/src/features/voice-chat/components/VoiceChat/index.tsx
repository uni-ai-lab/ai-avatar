import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import styles from "./VoiceChat.module.css";

const ZUNDAMON_RESPONSES = [
  "そうなのだ！とても面白いのだ！",
  "なるほどなのだ〜、勉強になるのだ！",
  "ずんだもんも同じことを思っていたのだ！",
  "それは素晴らしいアイデアなのだ！",
  "もっと詳しく教えてほしいのだ〜",
  "ずんだもんはそれが大好きなのだ！",
  "とても興味深い話なのだ！",
  "一緒に考えてみるのだ〜",
  "それはとても大切なことなのだ！",
  "ずんだもんも応援するのだ〜！",
];

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

  const getRandomResponse = () => {
    return ZUNDAMON_RESPONSES[
      Math.floor(Math.random() * ZUNDAMON_RESPONSES.length)
    ];
  };

  const handleSubmit = (e: React.FormEvent) => {
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

      setTimeout(
        () => {
          const zundamonMessage = {
            id: Date.now() + 1,
            text: getRandomResponse(),
            sender: "zundamon",
          };
          setMessages((prev) => [...prev, zundamonMessage]);
          setIsTyping(false);
        },
        1000 + Math.random() * 1000,
      ); // 1-2秒のランダムな遅延
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
