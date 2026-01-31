// services/vectorizeData.ts
import * as lancedb from "@lancedb/lancedb";
import { generateEmbedding } from "./ollamaEmbedder";
import type { CodeChunk } from "../../src/types/types";

export async function upsertVectorIndex(chunks: CodeChunk[]) {
  const dbPath = "src/data/";
  const db = await lancedb.connect(dbPath);

  const vectorizedList = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Generate embeddings for each chunk in the batch concurrently
    const batchResults = await Promise.all(
      batch.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk.text);
        return { ...chunk, vector: embedding };
      }),
    );

    vectorizedList.push(...batchResults);
    console.log(
      `Progress: ${Math.round(((i + batch.length) / chunks.length) * 100)}%`,
    );
  }

  await db.createTable("testdata", vectorizedList, {
    mode: "overwrite",
  });
}
