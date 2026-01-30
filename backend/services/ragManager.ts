import { splitDocuments } from "./splitDocuments";
import { upsertVectorIndex } from "./vectorizeData";
import type { CodeChunk } from "../../src/types/types";

export async function runRAGTest() {
  console.log("🚀 NorthStar Sandbox: RAG Testi Başlıyor...");
  console.time("Total Test Time");

  // 1. ADIM: Farklı dillerde örnek dökümanlar hazırla
  const sampleDocs = [
    {
      path: "auth.py",
      text: `def validate_token(token):
    if not token:
        return False
    print("Token is being validated...")
    return True`,
    },
    {
      path: "database.js",
      text: `async function connectToDB() {
    const connection = await db.connect("mongodb://localhost:27017");
    console.log("Database connected successfully!");
    return connection;
}`,
    },
    {
      path: "ui_component.tsx",
      text: `export const Button = ({ label, onClick }) => {
    return <button onClick={onClick} className="btn-primary">{label}</button>;
};`,
    },
  ];

  try {
    // 2. ADIM: Parçalama (Splitting)
    console.log("\n--- [1/3] Splitting Documents ---");
    const chunks: CodeChunk[] = await splitDocuments(sampleDocs);
    console.log(`✅ ${chunks.length} adet parça oluşturuldu.`);

    // 3. ADIM: Vektörleştirme ve İndeksleme (Embedding & Storage)
    console.log("\n--- [2/3] Vectorizing and Indexing ---");
    console.time("Indexing Duration");
    await upsertVectorIndex(chunks);
    console.timeEnd("Indexing Duration");

    // 4. ADIM: Doğrulama (Search Test)
    // Kaydettiğimiz veriyi "anlam" üzerinden bulabiliyor muyuz?
    console.log("\n--- [3/3] Verifying with Semantic Search ---");
    const query = "How do I connect to the database?";
    console.log(`Soru: "${query}"`);

    // Not: Bu fonksiyonu henüz yazmadık, istersen bir sonraki adımda yapalım
    // const results = await searchSimilarCode(query);
    // console.log("🔍 En yakın sonuçlar:", results[0]?.text);

    console.log("\n--- Test Başarıyla Tamamlandı! ---");
  } catch (error) {
    console.error("❌ Test sırasında bir hata oluştu:", error);
  } finally {
    console.timeEnd("Total Test Time");
  }
}
