// services/search.ts
import { generateEmbedding } from "./ollamaEmbedder";
import * as lancedb from "@lancedb/lancedb";

export async function searchInEmbeddings(query: string, topK = 3) {
  const dbPath = "src/data/";
  const db = await lancedb.connect(dbPath);
  const table = await db.openTable("testdata");

  if (!table) {
    throw new Error("Vector table 'testdata' not found.");
  }

  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding) {
    throw new Error("Failed to generate embedding for the query.");
  }

  const searchResults = await table
    .search(queryEmbedding)
    .limit(topK)
    .toArray();

  if (searchResults.length === 0) {
    console.log("⚠️ No results found.");
  }

  return searchResults;
}
