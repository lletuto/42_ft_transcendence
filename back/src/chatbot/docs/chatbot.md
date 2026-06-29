# The AI Chatbot — How the RAG Pipeline Works

The platform includes an AI assistant that answers questions about the game and
the project. It is built as a RAG (Retrieval-Augmented Generation) system, which
means the language model does not answer from memory alone: it is given relevant
pieces of the project documentation and answers based on them.

## Why RAG and not a plain chatbot

A plain large language model would hallucinate or give generic answers about
Rock-Paper-Scissors instead of the actual rules of this project. RAG grounds the
answers in the real documentation, so the assistant stays accurate, can cite the
project's own rules, and only needs a small, cheap model because the knowledge
comes from the retrieved context rather than from the model's training.

## The indexing pipeline (runs once at startup)

When the backend boots, the chatbot service reads every document in its `docs/`
folder (Markdown, text and PDF files). For each document it:

1. Extracts the raw text (PDFs are parsed page by page).
2. Splits the text into overlapping chunks of about 1000 characters with a
   200-character overlap, so that a sentence cut between two chunks is not lost.
3. Turns each chunk into an embedding — a vector of 768 numbers that captures the
   meaning of the text — using a local Ollama model called `nomic-embed-text`.
4. Stores each chunk together with its vector in an in-memory vector store.

This means embeddings are computed locally and for free, and the whole knowledge
base is rebuilt every time the backend starts.

## The query pipeline (runs on each question)

When a user asks a question:

1. The question is embedded into a vector with the same Ollama model.
2. The service compares that vector with every stored chunk using cosine
   similarity (the cosine of the angle between two vectors: 1 means very
   similar, 0 means unrelated).
3. It keeps the four most similar chunks as the context.
4. It sends a prompt to the Groq LLM (`llama-3.3-70b-versatile`) containing the
   retrieved context and the question, asking it to answer only from that
   context and in the same language as the question.
5. If the answer is not in the context, the assistant says it cannot find the
   information rather than inventing one.

## Technologies used

- LangChain to orchestrate the text splitting and model calls.
- Ollama with `nomic-embed-text` for embeddings (local, no API cost).
- Groq with `llama-3.3-70b-versatile` for response generation (free tier).
- An in-memory vector store (a simple array of chunk + vector pairs) with a
  hand-written cosine similarity function.

## Security

The chatbot endpoint is protected: only authenticated users with a valid JWT
cookie can call it. Incoming messages are validated on the backend (the message
must be a non-empty string under a maximum length) before any processing.
