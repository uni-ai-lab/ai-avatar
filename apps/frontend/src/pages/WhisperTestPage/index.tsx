import { useState, useRef, useEffect } from "react";
import { sendVoiceChatAudio } from "../../features/voice-chat/api/sendVoiceChatAudio";
import type { VoiceChatAudioResponse } from "../../features/voice-chat/types";

export const WhisperTestPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<VoiceChatAudioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // コンポーネントのアンマウント時にオブジェクトURLをクリーンアップ
  useEffect(() => {
    return () => {
      if (audioFile) {
        URL.revokeObjectURL(URL.createObjectURL(audioFile));
      }
    };
  }, [audioFile]);

  // 利用可能な音声入力デバイスを取得
  const getAudioDevices = async () => {
    setIsLoadingDevices(true);
    setError(null);
    
    try {
      // マイクの許可を要求
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // デバイス一覧を取得
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      setAudioDevices(audioInputDevices);
      
      // デフォルトデバイスが設定されていない場合、最初のデバイスを選択
      if (!selectedDeviceId && audioInputDevices.length > 0) {
        setSelectedDeviceId(audioInputDevices[0].deviceId);
      }
    } catch (err) {
      setError("マイクデバイスの取得に失敗しました: " + (err as Error).message);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // コンポーネントマウント時にデバイス一覧を取得
  useEffect(() => {
    getAudioDevices();
  }, []);

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } }
          : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("マイクへのアクセスが拒否されました");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await sendVoiceChatAudio({ audio: audioFile });
      setResult(response);
    } catch (err) {
      setError("音声の処理中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Whisper API テストページ</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h2>マイクデバイス選択</h2>
        {isLoadingDevices ? (
          <p>マイクデバイスを検索中...</p>
        ) : (
          <>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                padding: "8px",
                marginRight: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "300px"
              }}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `マイク ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
            <button
              onClick={getAudioDevices}
              style={{
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              デバイス再取得
            </button>
            {audioDevices.length > 0 && (
              <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                検出されたマイクデバイス数: {audioDevices.length}個
              </div>
            )}
          </>
        )}
      </div>
      
      <div style={{ marginBottom: "20px" }}>
        <h2>音声録音</h2>
        <div style={{ marginBottom: "10px" }}>
          {!isRecording ? (
            <button onClick={startRecording} style={{ marginRight: "10px" }}>
              録音開始
            </button>
          ) : (
            <button onClick={stopRecording} style={{ marginRight: "10px" }}>
              録音停止
            </button>
          )}
          {isRecording && <span style={{ color: "red" }}>● 録音中...</span>}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>またはファイルをアップロード</h2>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ marginBottom: "10px" }}
        />
      </div>

      {audioFile && (
        <div style={{ marginBottom: "20px" }}>
          <h3>選択されたファイル:</h3>
          <p>{audioFile.name} ({(audioFile.size / 1024).toFixed(2)} KB)</p>
          
          <div style={{ marginBottom: "15px" }}>
            <h4>録音内容の再生:</h4>
            <audio 
              controls 
              src={URL.createObjectURL(audioFile)}
              style={{ width: "100%", marginTop: "5px" }}
            >
              お使いのブラウザは音声再生をサポートしていません。
            </audio>
          </div>
          
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              backgroundColor: isLoading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "処理中..." : "音声を送信"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          border: "1px solid #f44336",
          borderRadius: "4px",
          color: "#d32f2f"
        }}>
          エラー: {error}
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: "20px", 
          padding: "20px", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px" 
        }}>
          <h3>結果:</h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>認識されたテキスト:</strong>
            <p style={{ 
              padding: "10px", 
              backgroundColor: "white", 
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}>
              {result.userMessage}
            </p>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <strong>検出された言語:</strong> {result.detectedLanguage}
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <strong>ずんだもんの返答:</strong>
            <p style={{ 
              padding: "10px", 
              backgroundColor: "white", 
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}>
              {result.zundamonResponse}
            </p>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>音声応答:</strong>
            {result.audioBase64 ? (
              <div>
                <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                  VoiceVox合成音声:
                </p>
                <audio 
                  controls 
                  src={`data:audio/wav;base64,${result.audioBase64}`}
                  style={{ width: "100%", marginTop: "5px" }}
                />
              </div>
            ) : (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                  VoiceVox音声合成が利用できません。ブラウザの音声合成を使用:
                </p>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance(result.zundamonResponse);
                      utterance.lang = 'ja-JP';
                      utterance.rate = 0.8;
                      utterance.pitch = 1.2;
                      window.speechSynthesis.speak(utterance);
                    } else {
                      alert('お使いのブラウザは音声合成をサポートしていません。');
                    }
                  }}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px"
                  }}
                >
                  🔊 テキスト読み上げ
                </button>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🔇 停止
                </button>
              </div>
            )}
          </div>
          
          <div style={{ fontSize: "12px", color: "#666" }}>
            処理時刻: {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};