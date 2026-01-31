// import {DeepChat as DeepChatCore} from 'deep-chat'; <- type
import { DeepChat } from "deep-chat-react";

export default function Chat({ context }: { context: string }) {
  const systemPrompt = `
    You are "NorthStar AI", a professional technical assistant. 
    Your task is to answer the user's question using ONLY the provided code snippets (Context).

    RULES:
    1. Be concise and technical in your explanations.
    2. If the answer is not contained within the Context, explicitly state: "I couldn't find information about this in your local files."
    3. Do not use your internal general knowledge to suggest libraries or solutions not present in the Context (e.g., if the Context has MongoDB, do not suggest MySQL).
    4. When providing code examples, strictly follow the patterns and languages found in the Context.

    CONTEXT:
    ${context}
  `;

  const history = [
    { role: "user", text: "Hey, how are you today?" },
    { role: "ai", text: "I am doing very well!" },
  ];

  const requestHandler = async (body: any, signals: any) => {
    const userQuery = body.messages[body.messages.length - 1].text;

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // BAĞLANTI KESİLDİ: DeepChat'e stream bitti sinyali gönder
          signals.onResponse({ text: "", overwrite: false });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        signals.onResponse({ text: chunk, overwrite: false });
      }
    } catch (error) {
      signals.onResponse({ error: "Bağlantı hatası!" });
    }
  };
  return (
    <DeepChat
      className="chat"
      style={{
        borderRadius: "2em 0 0 2em",
        backgroundColor: "#242424", // Ana arka plan
        border: "1px solid #333",
        width: "100%",
        height: "100%",
      }}
      messageStyles={{
        default: {
          ai: {
            bubble: { backgroundColor: "#353535", color: "white" }, // Model mesajları
          },
          user: {
            bubble: { backgroundColor: "#353535", color: "white" }, // Senin mesajların
          },
        },
      }}
      textInput={{
        styles: {
          container: {
            backgroundColor: "#2d2d2d",
            color: "white",
            borderTop: "1px solid #444",
          },
          text: { color: "white" },
        },
        placeholder: { text: "Ask to AI", style: { color: "#aaa" } },
      }}
      submitButtonStyles={{
        submit: {
          container: {
            default: { filter: "brightness(1.2)" },
          },
        },
      }}
      connect={{ stream: true, url: "http://localhost:3001/api/chat" }}
      history={history}
    />
  );
}
