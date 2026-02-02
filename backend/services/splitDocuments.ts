import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { CodeChunk, RawDoc } from "../../src/types/types";
import { SUPPORTED_LANGUAGES } from "../../src/utils/fileTypes";

/**
 * Enhanced document splitter that supports both source code and plain text files.
 * It injects contextual metadata (summaries) into each chunk to maintain global awareness.
 */
export async function splitDocuments(
  rawDocs: RawDoc[],
  summaries: Record<string, string>, // path -> summary mapping
): Promise<CodeChunk[]> {
  const allChunks: CodeChunk[] = [];

  for (const doc of rawDocs) {
    const ext = doc.path.split(".").pop()?.toLowerCase() || "";
    const fileSummary = summaries[doc.path] || "No summary available.";

    let splitter: RecursiveCharacterTextSplitter;

    // --- SPLITTING STRATEGY ---

    // We only use 'fromLanguage' for recognized source code.
    // Extensions like 'txt' or 'md' must use the generic splitter.
    const isCodeLanguage =
      SUPPORTED_LANGUAGES.includes(ext) && !["txt", "md"].includes(ext);

    const chunkSize = isCodeLanguage ? 3000 : 4000;
    const chunkOverlap = isCodeLanguage ? 400 : 600;

    if (isCodeLanguage) {
      try {
        // Structural splitters for programming languages (preserves functions/classes)
        splitter = RecursiveCharacterTextSplitter.fromLanguage(ext as any, {
          chunkSize: chunkSize,
          chunkOverlap: chunkOverlap,
        });
      } catch (e) {
        // Fallback to generic if language-specific initialization fails
        splitter = new RecursiveCharacterTextSplitter({
          chunkSize: chunkSize,
          chunkOverlap: chunkOverlap,
        });
      }
    } else {
      // For .txt, .md, or PDFs
      // We use specialized separators to prioritize splitting at paragraphs and sentences
      splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize, // Slightly larger chunks for documents to keep semantic meaning
        chunkOverlap: chunkOverlap,
        separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""],
      });
    }

    const splitTexts = await splitter.splitText(doc.text);

    // --- CONTEXT ENRICHMENT ---
    for (let i = 0; i < splitTexts.length; i++) {
      const text = splitTexts[i];

      // We wrap the text in a structural "envelope"
      // This forces the LLM to realize which file it is reading and what that file is about
      const contextualText = `
[SOURCE FILE]: ${doc.path}
[DOCUMENT SUMMARY]: ${fileSummary}
[CONTENT START]
${text}
[CONTENT END]
      `.trim();

      allChunks.push({
        text: contextualText,
        path: doc.path,
        language: ext,
        metadata: {
          chunkIndex: i,
          totalChunks: splitTexts.length,
        },
      });
    }
  }

  return allChunks;
}
