// services/ollamaEmbeder.ts
import ollama from "ollama";

export async function generateEmbedding({
  data,
  model = "nomic-embed-text",
}: {
  data: string;
  model?: string;
}) {
  try {
    const response = await ollama.embed({
      model: model,
      input: data,
    });

    // IMPORTANT: embed() always returns a matrix.
    // Since we send a single input, we should take the first element [0].
    return new Float32Array(response.embeddings[0]);
  } catch (error) {
    console.error("Ollama Service Error: ", error);
    throw error; // Throw the error up so the loop knows it broke
  }
}
