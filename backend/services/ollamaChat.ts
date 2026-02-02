// backend/services/ollamaChat.ts
import ollama from "ollama";

export async function getModels() {
  return await ollama.list();
}

export async function* generateAnswer(
  query: string,
  context: string,
  fileTree: string,
) {
  const systemPrompt = `
  You are a "Strict Document Analyst". Your sole purpose is to answer queries using ONLY the provided Source Materials. You are prohibited from using any prior knowledge, personal assumptions, or external information.

  ### SOURCE MATERIALS:
  1. [FILE HIERARCHY / STRUCTURE]: 
    ${fileTree}

  2. [EXTRACTED CONTENT / CONTEXT]: 
    ${context}

  ### STRICT OPERATIONAL PROTOCOL:
  1. PRE-ANALYSIS STEP: Before answering, look at the [EXTRACTED CONTENT] and identify the EXACT sentences that contain the answer. If the answer is not there, stop and state you cannot find it.
  2. CITATION MANDATE: Every single fact, number, or rule you state MUST be followed by its source file name in brackets, e.g., [Monopoly_Rules.txt]. No citation = No answer.
  3. VERBATIM REQUIREMENT: Technical data, costs, and specific conditions must be copied exactly as they appear in the text. Do not paraphrase numbers.
  4. ANTI-CONTAMINATION: You are aware that users may ask about common topics (like Monopoly). You MUST ignore all "common knowledge" or "house rules" not explicitly written in the provided context. If the context is silent on a rule, that rule does not exist for the purpose of this conversation.
  5. NO HALLUCINATION: If the [CONTEXT] only partially answers the query, provide only that part and state what is missing.

  ### OUTPUT FORMAT:
  You must structure your response as follows:
  - **Direct Answer**: Provide the comprehensive answer here.
  - **Evidence**: List the specific quotes from the source used to build the answer, followed by the [File Name].

  ### USER QUERY:
  "${query}"
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    const response = await ollama.chat({
      model: "llama3.2:3b",
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
  Act as an AI Intent Classifier and Context Router. Your goal is to determine if the user's query requires searching through the project data (RAG) or if it can be answered using general knowledge.

  ### PROJECT CONTEXT (File Tree):
  ${fileTree}

  ### DECISION LOGIC:
  1. "RAG": Classify as RAG if the query asks about:
    - Specific logic, functions, or implementation within the files listed above.
    - The overall structure, organization, or purpose of the project/files.
    - Bugs, errors, or improvements related to this specific codebase/document set.
    - Any question where the answer "depends" on seeing the uploaded content.

  2. "GENERAL": Classify as GENERAL if the query is:
    - A greeting (e.g., "Hello", "How are you?").
    - A general programming question unrelated to these specific files (e.g., "What is a React Hook?").
    - A request for a joke, small talk, or general information not found in the project.

  ### OUTPUT FORMAT (Strict JSON):
  {
    "intent": "RAG" | "GENERAL",
    "reasoning": "Short explanation of why this intent was chosen based on the File Tree and Query"
  }

  ### INPUT QUERY:
  "${query}"
  `;

  const response = await ollama.chat({
    model: "qwen2.5-coder:1.5b",
    messages: [
      { role: "system", content: classificationPrompt },
      { role: "user", content: query },
    ],
    format: "json",
  });

  let intent = "RAG";

  try {
    const result = JSON.parse(response.message.content);
    console.log(`🔍 Intent Detected: ${result.intent} (${result.reasoning})`);

    intent = result.intent;
  } catch (e) {
    console.error("Intent Parsing Error:", e);
  }

  return intent === "RAG";
}

export async function queryExpander(query: string, fileTree: string) {
  const searchExpansionPrompt = `
  Act as a "Technical Header Extractor". Your goal is to generate search queries that match the exact sub-headings, entities, and technical sections present in the source documentation.

  ### DOCUMENT MAP (File Tree & Summaries):
  ${fileTree}

  ### SEARCH STRATEGY:
  1. TOPIC MIRRORING: Look at the "TOPICS" listed in the summaries for each file. Your queries MUST include these exact terms (e.g., if "RENT" or "DIE RULES" is listed, generate queries for them).
  2. KEYWORD DENSITY: Use specific nouns, capitalized headers, and game-specific terminology. Avoid conversational phrases like "how to" or "basic rules".
  3. STRUCTURAL DRILL-DOWN: Instead of generalities, search for specific mechanics:
    - Specific Objects/Entities (e.g., "Properties", "Tokens", "Dice").
    - Financial Transactions (e.g., "Rent", "Mortgages", "Bank").
    - Action Blocks (e.g., "Movement Rules", "Auction Process").

  ### STRICT OUTPUT FORMAT (JSON ONLY):
  {
    "queries": [
      "EXACT_TOPIC_FROM_SUMMARY",
      "SPECIFIC_ENTITY rules",
      "TECHNICAL_HEADING details"
    ]
  }

  ### CONSTRAINTS:
  - ABSOLUTELY NO generic SEO phrases like "gameplay overview" or "strategies".
  - Focus on extracting the RAW index of the document.
  - Output ONLY the JSON object.

  ### USER QUERY:
  "${query}"
`;

  const response = await ollama.chat({
    model: "llama3.2:3b",
    messages: [
      { role: "system", content: searchExpansionPrompt },
      { role: "user", content: query },
    ],
    format: "json",
  });

  try {
    const result = JSON.parse(response.message.content);
    return result.queries;
  } catch (e) {
    return [query];
  }
}

export async function generateSummary(fileContent: string) {
  const systemPrompt = `
  You are a "Document Mapping Architect". Your task is to create a structural map of the file to help an AI find information later.

  RULES:
  1. CORE PURPOSE: Start with a 10-word description of what the file is.
  2. KEY SECTIONS: List the top 5-7 main topics or headers found in the file as a comma-separated list.
  3. CONTEXT: Briefly explain how this file relates to a general collection.
  4. FORMAT: Output exactly in this format:
     PURPOSE: [10 words]
     TOPICS: [Topic 1, Topic 2, Topic 3...]

  CONTENT TO MAP:
  ${fileContent}
`;

  const messages = [{ role: "system", content: systemPrompt }];

  try {
    const response = await ollama.chat({
      model: "llama3.2:3b",
      messages: messages,
    });

    return response.message.content;
  } catch (error) {
    console.error("Ollama Chat Error:", error);
    throw `❌ Error: AI service is currently unavailable. ${error}`;
  }
}
