import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAudioPlayer } from "features/voice-chat/hooks/useAudioPlayer";
import { useMessages } from "../../hooks/useMessages";
import styles from "./VoiceChat.module.css";
import { voiceChatSchema, VoiceChatSchema } from "./VoiceChatSchema";

export const VoiceChat = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const { messages, addMessage, isAddingMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playHello } = useAudioPlayer();

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<VoiceChatSchema>({
    defaultValues: {
      message: "",
    },
    resolver: zodResolver(voiceChatSchema),
  });

  const handleStartChat = () => {
    setChatStarted(true);
    playHello();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (errors.message) {
      alert(errors.message.message);
    }
  }, [errors.message]);

  const onSubmit: SubmitHandler<VoiceChatSchema> = (data) => {
    addMessage(data.message);
    resetField("message");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        {chatStarted && (
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
        )}
        {!chatStarted && (
          <div className={styles.startButtonWrapper}>
            <button
              className={styles.startChatButton}
              onClick={handleStartChat}
            >
              チャットを開始する
            </button>
          </div>
        )}

        <form className={styles.inputForm} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputContainer}>
            <input
              {...register("message")}
              className={styles.messageInput}
              disabled={!chatStarted || isAddingMessage}
              onKeyDown={handleKeyDown}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
            />
            <button
              className={styles.sendButton}
              disabled={!chatStarted || isAddingMessage || !register}
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
