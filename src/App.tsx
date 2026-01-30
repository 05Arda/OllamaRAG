import { useState } from "react";
import "./App.css";

import type { FolderNode } from "./types/types";
import FolderPicker from "./components/FolderPicker";
import FolderTree from "./components/FolderTree";
import Chat from "./components/ChatPage";

function App() {
  const [directory, setDirectory] = useState<FolderNode | null>(null);

  const handleAnalyze = async () => {
    alert("Hello!");
    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="container">
      <div className="fileManager">
        <FolderPicker onDirectoryChange={setDirectory} />
        <button onClick={() => handleAnalyze()}>Test!</button>

        {directory ? (
          <FolderTree directory={directory} />
        ) : (
          <div className="dropzone">
            <div className="information">
              <p>To get started, please upload folders or files.</p>
              <p>Don’t worry, everything stays on your local computer.</p>
            </div>
          </div>
        )}
      </div>
      <div className="chatArea">
        <Chat />
      </div>
    </div>
  );
}

export default App;
