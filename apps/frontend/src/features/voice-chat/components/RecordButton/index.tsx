import { Mic, MicOff, Loader } from "lucide-react";
import styles from "./RecordButton.module.css";

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}
export const RecordButton = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: RecordButtonProps) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const getButtonIcon = () => {
    if (isProcessing) {
      return <Loader className={styles.processingIcon} size={20} />;
    }

    if (isRecording) {
      return <MicOff size={20} />;
    }

    return <Mic size={20} />;
  };

  const getAriaLabel = () => {
    if (isProcessing) {
      return "音声認識処理中";
    }

    if (isRecording) {
      return "録音を停止";
    }

    return "録音を開始";
  };

  return (
    <div className={styles.recordButtonContainer} data-recording={isRecording}>
      <button
        aria-label={getAriaLabel()}
        className={styles.recordButton}
        disabled={disabled || isProcessing}
        onClick={handleClick}
        type="button"
      >
        {getButtonIcon()}
      </button>
    </div>
  );
};
