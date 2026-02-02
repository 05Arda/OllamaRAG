import { splitDocuments } from "./splitDocuments";
import { upsertVectorIndex } from "./vectorizeData";
import type { CodeChunk, RawDoc } from "../../src/types/types";

export async function startRAG(
  docs: RawDoc[],
  summaries: Record<string, string>,
) {
  console.log("🚀 NorthStar Sandbox: RAG Testi Başlıyor...");
  console.time("Total Test Time");

  try {
    // 2. ADIM: Splitting
    console.log("\n--- [1/3] Splitting Documents ---");
    const chunks: CodeChunk[] = await splitDocuments(docs, summaries);
    console.log(`✅ ${chunks.length} adet parça oluşturuldu.`);

    // 3. ADIM: Embedding & Storage
    console.log("\n--- [2/3] Embedding & Storage ---");
    console.time("Indexing Duration");
    await upsertVectorIndex(chunks);
    console.timeEnd("Indexing Duration");

    console.log("\n--- Test Başarıyla Tamamlandı! ---");
  } catch (error) {
    console.error("❌ Test sırasında bir hata oluştu:", error);
  } finally {
    console.timeEnd("Total Test Time");
  }
}
