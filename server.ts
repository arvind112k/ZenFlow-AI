import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// RAG Knowledge Base Setup
interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  embedding?: number[];
}

let knowledgeBase: KnowledgeItem[] = [];

async function initializeRAG() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "src/data/knowledge_base.json"), "utf8");
    knowledgeBase = JSON.parse(data);

    console.log("Embedding knowledge base...");
    for (const item of knowledgeBase) {
      const result = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [item.content],
      });
      item.embedding = result.embeddings[0].values;
    }
    console.log("RAG Knowledge Base initialized.");
  } catch (error) {
    console.error("Failed to initialize RAG:", error);
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize RAG in the background
  initializeRAG();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
      // 1. Embed user query
      const queryEmbeddingResult = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [message],
      });
      const queryEmbedding = queryEmbeddingResult.embeddings[0].values;

      // 2. Retrieve top-k relevant chunks
      const scoredItems = knowledgeBase
        .map(item => ({
          ...item,
          score: cosineSimilarity(queryEmbedding, item.embedding!)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const context = scoredItems.map(item => item.content).join("\n\n");

      // 3. Generate response with context
      const prompt = `
        You are a ZenFlow AI Meditation & Wellness Expert. 
        Your tone is calm, clear, and actionable.
        Use the following context to answer the user's question. 
        If the context doesn't contain the answer, use your general knowledge but stay within the meditation/yoga/wellness domain.
        
        Context:
        ${context}
        
        User Question: ${message}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      res.json({ 
        answer: response.text,
        sources: scoredItems.map(item => ({ category: item.category, id: item.id }))
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZenFlow AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
