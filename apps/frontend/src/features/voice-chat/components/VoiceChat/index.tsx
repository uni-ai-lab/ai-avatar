import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useAudioPlayer } from "features/voice-chat/hooks/useAudioPlayer";
import { useMessages } from "../../hooks/useMessages";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { RecordButton } from "../RecordButton";
import styles from "./VoiceChat.module.css";

interface StatusMessageProps {
  message: string;
  sender: "user" | "zundamon";
  showAnimation: boolean;
}

const StatusMessage = ({
  message,
  sender,
  showAnimation,
}: StatusMessageProps) => (
  <div
    className={`${styles.message} ${sender === "user" ? styles.userMessage : styles.zundamonMessage}`}
  >
    <div
      className={`${styles.messageContent} ${showAnimation ? styles.typingIndicator : ""}`}
    >
      {showAnimation && (
        <span className={styles.typingDots}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      )}
      {message}
    </div>
  </div>
);

export const VoiceChat = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [displayError, setDisplayError] = useState("");
  const { messages, addMessage, isAddingMessage } = useMessages();
  const { voiceInputState, voiceInputError, startRecording, stopRecording } =
    useVoiceInput();
  const { playHello } = useAudioPlayer();

  const isRecording = voiceInputState === "recording";
  const isProcessing = voiceInputState === "processing";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!voiceInputError) return;

    setDisplayError(voiceInputError);
    const timer = setTimeout(() => {
      setDisplayError("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [voiceInputError]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isAddingMessage) {
      addMessage(message.trim());
      setMessage("");
    }
  };

  const handleStartRecording = () => {
    setDisplayError("");
    startRecording();
  };

  const getSpeechStatusMessage = (): string | null => {
    if (displayError) {
      return displayError;
    }
    if (isRecording) {
      return "聞き取り中...";
    }
    if (isProcessing) {
      return "処理中...";
    }
    return null;
  };

  const speechStatusMessage = getSpeechStatusMessage();

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

            {speechStatusMessage && (
              <StatusMessage
                message={speechStatusMessage}
                sender="user"
                showAnimation={!voiceInputError}
              />
            )}

            {isAddingMessage && (
              <StatusMessage
                message="入力中なのだ..."
                sender="zundamon"
                showAnimation={true}
              />
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

        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <input
              className={styles.messageInput}
              disabled={
                !chatStarted || isAddingMessage || isRecording || isProcessing
              }
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
              value={message}
            />
            <RecordButton
              disabled={!chatStarted || isAddingMessage}
              isProcessing={isProcessing}
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
            />
            <button
              aria-label="メッセージを送信"
              className={styles.sendButton}
              disabled={
                !chatStarted ||
                !message.trim() ||
                isAddingMessage ||
                isRecording ||
                isProcessing
              }
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
