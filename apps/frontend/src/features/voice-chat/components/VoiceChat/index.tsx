import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAudioPlayer } from "features/voice-chat/hooks/useAudioPlayer";
import { useMessages } from "../../hooks/useMessages";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { RecordButton } from "../RecordButton";
import styles from "./VoiceChat.module.css";
import { voiceChatSchema, VoiceChatSchema } from "./VoiceChatSchema";

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
  const [displayError, setDisplayError] = useState("");
  const { messages, addMessage, isAddingMessage } = useMessages();
  const {
    recordingState,
    recognizedText,
    recognitionError,
    startRecording,
    stopRecording,
  } = useSpeechRecognition();

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";
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

  useEffect(() => {
    if (recognizedText) {
      addMessage(recognizedText);
    }
  }, [recognizedText, addMessage]);

  useEffect(() => {
    if (!recognitionError) return;

    setDisplayError(recognitionError);
    const timer = setTimeout(() => {
      setDisplayError("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [recognitionError]);

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
                showAnimation={!recognitionError}
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

        <form className={styles.inputForm} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputContainer}>
            <input
              {...register("message")}
              className={styles.messageInput}
              disabled={
                !chatStarted || isAddingMessage || isRecording || isProcessing
              }
              onKeyDown={handleKeyDown}
              placeholder="ずんだもんにメッセージを送るのだ..."
              type="text"
            />
            <RecordButton
              disabled={!chatStarted || isAddingMessage}
              isProcessing={isProcessing}
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
            />
            <button
              className={styles.sendButton}
              disabled={
                !chatStarted ||
                isAddingMessage ||
                !register ||
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
