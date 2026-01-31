// backend/services/ollamaChat.ts
import ollama from "ollama";

export function getModels() {
  return ollama.list();
}

export async function* generateAnswer(query: string, context: string) {
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

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder:1.5b",
      messages: messages,
      stream: true,
    });

    for await (const part of response) {
      yield part.message.content;
    }
  } catch (error) {
    console.error("Ollama Chat Error:", error);
    yield "❌ Error: AI service is currently unavailable.";
  }
}

export async function* generate(query: string) {
  const messages = [{ role: "user", content: query }];

  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder:1.5b",
      messages: messages,
      stream: true,
    });

    for await (const part of response) {
      yield part.message.content;
    }
  } catch (error) {
    console.error("Ollama Chat Error:", error);
    yield "❌ Error: AI service is currently unavailable.";
  }
}

export async function intentRouter(query: string) {
  const classificationPrompt = `
    Classify the following user input into one of two categories: "TECHNICAL" or "GENERAL".
    - "TECHNICAL": Questions about code, files, programming, errors, or software architecture.
    - "GENERAL": Greetings, small talk, or non-technical topics.
    
    Answer with only one word: TECHNICAL or GENERAL.
    Input: ${query}
  `;

  const response = await ollama.chat({
    model: "qwen2.5-coder:1.5b",
    messages: [
      { role: "system", content: classificationPrompt },
      { role: "user", content: query },
    ],
  });

  return response.message.content.trim().toUpperCase().includes("TECHNICAL");
}
