// import {DeepChat as DeepChatCore} from 'deep-chat'; <- type
import { DeepChat } from "deep-chat-react";

export default function Chat() {
  const history = [
    { role: "user", text: "Hey, how are you today?" },
    { role: "ai", text: "I am doing very well!" },
  ];
  // demo/style/textInput are examples of passing an object directly into a property
  // history is an example of passing a state object into a property
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
        placeholder: { text: "Welcome to the demo!", style: { color: "#aaa" } },
      }}
      submitButtonStyles={{
        submit: {
          container: {
            default: { filter: "brightness(1.2)" },
          },
        },
      }}
      demo={true}
      history={history}
    />
  );
}
