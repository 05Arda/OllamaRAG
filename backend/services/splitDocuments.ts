import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { CodeChunk } from "../../src/types/types";

/**
 * Represents a single chunk of code with its metadata.
 */

/**
 * Splits loaded workspace documents into smaller, manageable chunks for RAG.
 * It attempts to use language-specific splitting rules to preserve code structure.
 */
export async function splitDocuments(
  rawDocs: { text: string; path: string }[],
): Promise<CodeChunk[]> {
  const allChunks: CodeChunk[] = [];

  // Official programming languages supported by LangChain's specialized splitters
  const SUPPORTED_LANGUAGES = [
    "cpp",
    "go",
    "java",
    "js",
    "php",
    "proto",
    "python",
    "rst",
    "ruby",
    "rust",
    "scala",
    "swift",
    "markdown",
    "latex",
    "html",
    "sol",
  ];

  const chunkSize = 1000;
  const chunkOverlap = 150;

  for (const doc of rawDocs) {
    // Extract file extension and normalize to lowercase
    const ext = doc.path.split(".").pop()?.toLowerCase() || "";

    let splitter: RecursiveCharacterTextSplitter;

    // STEP 1: Check if the language has a specialized splitter (e.g., Python, JS)
    // Specialized splitters avoid breaking code in the middle of a function or class.
    if (SUPPORTED_LANGUAGES.includes(ext)) {
      try {
        splitter = RecursiveCharacterTextSplitter.fromLanguage(ext as any, {
          chunkSize: chunkSize, // Target size of each chunk in characters
          chunkOverlap: chunkOverlap, // Characters to overlap between chunks to maintain context
        });
      } catch (e) {
        // Fallback to generic splitter if specialized initialization fails
        splitter = new RecursiveCharacterTextSplitter({
          chunkSize: chunkSize,
          chunkOverlap: chunkOverlap,
        });
      }
    } else {
      // STEP 2: Use a generic character-based splitter for unsupported formats (JSON, SQL, etc.)
      // This ensures the file is still indexed, even without language-specific rules.
      splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      });
    }

    // Split the document text into an array of strings
    const splitTexts = await splitter.splitText(doc.text);

    // Map the split strings back to our CodeChunk interface
    for (const text of splitTexts) {
      allChunks.push({
        text: text,
        path: doc.path,
        language: ext,
      });
    }
  }

  return allChunks;
}
