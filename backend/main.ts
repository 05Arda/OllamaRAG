import express from "express";
import type { Request, Response } from "express";
import { runRAGTest } from "./services/ragManager";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

//English
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running 🚀");
});

app.post("/api/analyze", async (req: Request, res: Response) => {
  console.log("📥 Analysis request received...");

  try {
    await runRAGTest();

    res.json({
      status: "success",
      message: "Analysis and RAG test completed successfully!",
    });
  } catch (err: any) {
    console.error("❌ Error occurred:", err);

    res.status(500).json({
      status: "error",
      error: err.message || "An unknown error occurred.",
    });
  }
});

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
