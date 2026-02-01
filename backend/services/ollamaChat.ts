// backend/services/ollamaChat.ts
import ollama from "ollama";

export function getModels() {
  return ollama.list();
}

export async function* generateAnswer(
  query: string,
  context: string,
  fileTree: string,
) {
  const systemPrompt = `
   You are "NorthStar AI", a professional technical assistant. 
    Your task is to answer the user's question using the provided project information (File Tree and Context).

    RULES:
    1. Be concise and technical.
    2. Use the "File Tree" to understand the project structure and the "Context" to understand the code logic.
    3. If the information is not present in EITHER the File Tree OR the Context, state: "I couldn't find information about this in your local files."
    4. Do not suggest external libraries not mentioned in the provided information.

    [PROJECT STRUCTURE / FILE TREE]:
    ${fileTree}

    [CODE SNIPPETS / CONTEXT]:
    ${context}
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    const response = await ollama.chat({
      model: "smollm2:latest",
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

export async function* generate(query: string, fileTree: string) {
  const systemPrompt = `
    File Tree:
    ${fileTree}
  `;
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder:7b",
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

export async function intentRouter(query: string, fileTree: string) {
  const classificationPrompt = `
  Act as an AI Intent Classifier and Context Router for a codebase assistant. 
  Your goal is to analyze the user's input and determine what information is required to provide an accurate answer.

  ### CATEGORIES:
  1. "TECHNICAL": Questions about the specific codebase, file structure, logic, bugs, or architectural patterns.
  2. "GENERAL": Greetings, small talk, or general programming questions that do NOT require looking at the current project (e.g., "What is a for loop?").

  ### CONTEXT REQUIREMENTS:
  - "needs_file_tree": Set to true if the question is about project structure, finding files, or where a module is located.
  - "needs_code_snippets": Set to true if the question is about specific logic, implementation details, or fixing a bug in the code.

  ### OUTPUT FORMAT (Strict JSON):
  {
    "category": "TECHNICAL" | "GENERAL",
    "needs_file_tree": boolean,
    "needs_code_snippets": boolean,
    "reasoning": "Short explanation of why this context is needed"
  }

  ### FILE TREE:
    ${fileTree}

  ### INPUT:
  "${query}"
  `;

  const response = await ollama.chat({
    model: "qwen2.5-coder:7b",
    messages: [
      { role: "system", content: classificationPrompt },
      { role: "user", content: query },
    ],
  });

  return response.message.content.trim().toUpperCase().includes("TECHNICAL");
}
