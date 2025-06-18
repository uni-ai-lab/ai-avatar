import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { sendVoiceChat } from "features/voice-chat/api/sendVoiceChat";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendVoiceChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await sendVoiceChat({ message });
      return response.zundamonResponse;
    },
    onError: (error) => {
      console.error("API Error:", error);
      // エラー時のフォールバック処理
      const zundamonMessage = {
        id: Date.now() + 1,
        text: "ごめんなのだ〜、ちょっと調子が悪いのだ...",
        sender: "zundamon",
      };
      setMessages((prev) => [...prev, zundamonMessage]);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendVoiceChatMutation.isPending) {
      const userMessage = {
        id: Date.now(),
        text: message.trim(),
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      sendVoiceChatMutation.mutate(userMessage.text, {
        onSuccess: (zundamonResponseText) => {
          const zundamonMessage = {
            id: Date.now() + 1,
            text: zundamonResponseText,
            sender: "zundamon",
          };
          setMessages((prev) => [...prev, zundamonMessage]);
        },
      });
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

          {sendVoiceChatMutation.isPending && (
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
              disabled={sendVoiceChatMutation.isPending}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
              value={message}
            />
            <button
              className={styles.sendButton}
              disabled={!message.trim() || sendVoiceChatMutation.isPending}
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
