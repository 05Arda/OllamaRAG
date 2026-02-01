import { splitDocuments } from "./splitDocuments";
import { upsertVectorIndex } from "./vectorizeData";
import type { CodeChunk, RawDoc } from "../../src/types/types";

export async function startRAG(docs: RawDoc[]) {
  console.log("🚀 NorthStar Sandbox: RAG Testi Başlıyor...");
  console.time("Total Test Time");

  try {
    // 2. ADIM: Parçalama (Splitting)
    console.log("\n--- [1/3] Splitting Documents ---");
    const chunks: CodeChunk[] = await splitDocuments(docs);
    console.log(`✅ ${chunks.length} adet parça oluşturuldu.`);

    // 3. ADIM: Vektörleştirme ve İndeksleme (Embedding & Storage)
    console.log("\n--- [2/3] Vectorizing and Indexing ---");
    console.time("Indexing Duration");
    await upsertVectorIndex(chunks);
    console.timeEnd("Indexing Duration");

    /*

    // 4. ADIM: Doğrulama (Search Test)
    // Kaydettiğimiz veriyi "anlam" üzerinden bulabiliyor muyuz?
    console.log("\n--- [3/3] Verifying with Semantic Search ---");
    const query = "How do I connect to the database?";
    console.log(`Soru: "${query}"`);
    const results = await searchInEmbeddings(query);

    if (results.length === 0) {
      console.log("⚠️ No results found.");
    }

    results.forEach((res, i) => {
      console.log(
        `\n[Result ${i + 1}/${results.length}] (Score: ${res._distance?.toFixed(4)})`,
      );
      console.log(`Path: ${res.path}`);
      console.log(`Text: ${res.text}`);
    });

    let fullMessage = "";
    for await (const chunk of generateAnswer(query, results.toString())) {
      fullMessage += chunk;
      //console.log(chunk);
    }

    console.log(fullMessage);*/

    console.log("\n--- Test Başarıyla Tamamlandı! ---");
  } catch (error) {
    console.error("❌ Test sırasında bir hata oluştu:", error);
  } finally {
    console.timeEnd("Total Test Time");
  }
}
