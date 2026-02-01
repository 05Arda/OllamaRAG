import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

import multer from "multer";

import { intentRouter, generate, generateAnswer } from "./services/ollamaChat";
import { searchInEmbeddings } from "./services/search";
import { startRAG } from "./services/ragManager";
import type { RawDoc } from "../src/types/types";

const app = express();
app.use(cors());
app.use(express.json());

const fileToRawDoc = (file: Express.Multer.File): RawDoc => {
  return {
    path: file.originalname,
    text: file.buffer.toString("utf-8"),
  };
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let fileTree = "";

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running 🚀");
});

app.post("/api/chat", async (req: Request, res: Response) => {
  const { messages } = req.body;
  const messageText = messages[messages.length - 1]?.text;

  if (!messageText) {
    res.status(400).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    console.log("📥 Chat request received:", messageText);
    const response = await intentRouter(messageText, fileTree);
    console.log("📤 Chat response intent:", response);

    let answerStream;
    if (response) {
      // Technical Question Handling
      const topK = 5;
      const results = await searchInEmbeddings(messageText, topK);

      if (results.length === 0) {
        console.log("⚠️ No results found.");
      }

      answerStream = await generateAnswer(
        messageText,
        results.map((r) => r.text).join("\n"),
        fileTree,
      );
    } else {
      answerStream = await generate(messageText, fileTree);
    }

    for await (const chunk of answerStream) {
      // ✅ chunk'ı JSON içine sar, DeepChat formatı
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    // Stream tamamlandığında
    res.write("data: [DONE]\n\n");
    return res.end();
  } catch (err: any) {
    console.error("❌ Error occurred:", err);
    res.end();
  }
});

app.post(
  "/api/analyze",
  upload.array("files", 100),
  async (req: Request, res: Response) => {
    console.log("📥 Analysis request received...");

    try {
      const files = req.files as Express.Multer.File[];
      fileTree = req.body.fileTree;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "File not uploaded!" });
      }

      console.log(`📥 ${files.length} files received.`);

      const docs = files.map(fileToRawDoc);
      await startRAG(docs);

      return res.status(200).json({
        status: "success",
        message: "Analysis and RAG test completed successfully!",
      });
    } catch (err: any) {
      console.error("❌ Error occurred:", err);

      if (!res.headersSent) {
        return res.status(500).json({
          status: "error",
          error: err.message || "An unknown error occurred.",
        });
      }
    }
  },
);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`
  -----------------------------------------
  🚀 Backend Ready!
  📡 Port: ${PORT}
  🔗 Test: http://localhost:${PORT}/
  -----------------------------------------
  `);
});
