import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { OllamaEmbeddings } from '@langchain/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PdfReader } from 'pdfreader';
import * as path from 'path';
import * as fs from 'fs';

interface VectorEntry {
  text: string;
  vector: number[];
}

 // RagService is responsible for loading documents, processing user queries, and generating responses using a retrieval-augmented generation (RAG) approach. It extracts text from documents, computes embeddings, and uses cosine similarity to find relevant information to answer user questions.
@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private vectorEntries: VectorEntry[] = [];

  private llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  });

  private embeddings = new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_URL || 'http://ollama:11434',
  });

  onModuleInit() {
    this.logger.log('Docs loading...');
    // Non-bloquant : on n'attend PAS le RAG pour démarrer l'app. Sinon, si ollama
    // est lent/indisponible, tout le backend (login inclus) reste injoignable -> 502.
    // Le chatbot se charge en arrière-plan ; s'il échoue, seul le chatbot est indispo.
    this.loadDocs()
      .then(() =>
        this.logger.log(
          `✅ CHATBOT RAG ready ! ${this.vectorEntries.length} chunks indexés`,
        ),
      )
      .catch((e) =>
        this.logger.error(`RAG load échoué (chatbot indispo): ${e?.message ?? e}`),
      );
  }

  private extractTextFromPdf(pdfPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new PdfReader();
      let text = '';

      reader.parseFileItems(pdfPath, (err: any, item: any) => {
        if (err) reject(err);
        else if 
          (!item) resolve(text);
        else if 
          (item.text) text += item.text + ' ';
      });
    });
  }

  // Extract text from a file based on its extension. Supports PDF, TXT, and MD files.
  private async extractText(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      return this.extractTextFromPdf(filePath);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  // Load documents from the src/chatbot/docs directory, split them into chunks, compute embeddings, and store them in memory. Only files with .pdf, .txt, or .md extensions are processed.
  private async loadDocs() {
    const docsDir = path.join(process.cwd(), 'src/chatbot/docs');

    if (!fs.existsSync(docsDir)) {
      this.logger.warn(`⚠️ Doc not found: ${docsDir} (no docs will be loaded)`);
      return;
    }

    const allowed = ['.pdf', '.txt', '.md'];
    const files = fs
      .readdirSync(docsDir)
      .filter((f) => allowed.includes(path.extname(f).toLowerCase()));

    if (files.length === 0) {
      this.logger.warn(`⚠️ No Docs (.pdf/.txt/.md) dans ${docsDir}`);
      return;
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    for (const file of files) {
      const filePath = path.join(docsDir, file);
      const text = await this.extractText(filePath);

      const docs = await splitter.createDocuments([text]);
      this.logger.log(`📄 ${file} → ${docs.length} chunks`);

      for (const doc of docs) {
        const vector = await this.embeddings.embedQuery(doc.pageContent);
        this.vectorEntries.push({ text: doc.pageContent, vector });
      }
    }
  }

  // Compute cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    // Guard against a zero vector (empty chunk) to avoid dividing by zero (NaN).
    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }

  // Process a user query by computing its embedding, finding the most relevant document chunks based on cosine similarity, and generating a response using the LLM.
  async query(question: string): Promise<string> {
    try {
      const questionVector = await this.embeddings.embedQuery(question);

      const ranked = this.vectorEntries
        .map(entry => ({
          text: entry.text,
          score: this.cosineSimilarity(questionVector, entry.vector),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const context = ranked.map(r => r.text).join('\n\n');

      const response = await this.llm.invoke(`
        You are an expert assistant about our custom rock, paper, scissor.
        You MUST always answer in English, no matter what language the question is written in.
        Answer using only the provided context.
        If the answer is not in the context, say (in English) that you cannot find this information in the documentation and suggest asking Maxence the GOAT.

        Context:
        ${context}

        Question: ${question}

        Answer concisely, and strictly in English.
      `);

      return (response.content as string);
    } catch (error) {
      // Ollama (embeddings) or Groq (LLM) unreachable / rate-limited: log and return a friendly message instead of crashing the request.
      this.logger.error(`RAG query failed: ${error}`);
      return 'Sorry, the assistant is unavailable right now. Please try again later.';
    }
  }
}
