import { VoiceChatPage } from "./pages/VoiceChatPage";
import { WhisperTestPage } from "./pages/WhisperTestPage";

function App() {
  const currentPath = window.location.pathname;
  
  if (currentPath === "/whisper-test") {
    return <WhisperTestPage />;
  }
  
  return <VoiceChatPage />;
}

export default App;
