Local RAG with LLMs 🚀

A privacy-focused, fully local Retrieval-Augmented Generation (RAG) system powered by Ollama. Interact with your private documents without ever sending data to the cloud.

🌟 Overview

This project provides a robust framework for building a local knowledge base using your own documents (PDF, TXT, Markdown). By leveraging Ollama for local LLM inference, it ensures that your sensitive data remains on your machine while providing the power of state-of-the-art language models.

✨ Key Features

100% Private & Local: No API keys required. No data leaves your hardware.

Ollama Powered: Seamlessly switch between models like Llama 3, Mistral, Phi-3, or Gemma.

Flexible Document Processing: Supports multiple file formats for ingestion.

Fast Retrieval: Optimized vector similarity search for context-aware responses.

Easy Integration: Designed to be modular and easy to extend.

🏗️ Architecture

Ingestion: Load your documents from a local directory.

Chunking: Split text into optimized segments for better context window management.

Embedding: Convert text chunks into high-dimensional vectors using local embedding models.

Vector Store: Store these embeddings in a local vector database.

Querying: When you ask a question, the system finds the most relevant chunks.

Generation: The relevant context + your question are sent to Ollama to generate a precise answer.

🚀 Getting Started

Prerequisites

Ollama: Download and install Ollama

Models: Pull your preferred model (e.g., ollama pull llama3)


🗺️ Roadmap

[ ] Support for OCR (Image-to-text) in PDF files.

[ ] Support for Excel and CSV datasets.

[ ] Persistent Chat History.

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Built with ❤️ for the open-source community.
