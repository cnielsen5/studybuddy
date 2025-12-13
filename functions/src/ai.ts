// functions/src/ai.ts
import * as logger from "firebase-functions/logger";
import { genkit } from "genkit";
import { vertexAI, textEmbedding004 } from "@genkit-ai/vertexai";
import { embed } from "@genkit-ai/ai/embedder";

// Lazy initialization of Genkit to prevent blocking module load
// This ensures functions can start even if Genkit initialization fails
let aiInstance: any = null;

function getGenkitInstance() {
  if (!aiInstance) {
    if (!genkit || !vertexAI) {
      throw new Error("Genkit modules not loaded. Check that genkit packages are installed.");
    }
    try {
      // Initialize Genkit with the Vertex AI Plugin
      // This automatically uses the Google Cloud credentials of your running function.
      aiInstance = genkit({
        plugins: [
          vertexAI({ location: "us-central1" }) // Ensure this matches your Firebase region
        ],
      });
    } catch (error) {
      logger.error("Failed to initialize Genkit", error);
      throw error;
    }
  }
  return aiInstance;
}

/**
 * Generates a semantic vector using Google's text-embedding-004 model.
 * @param text The content to vectorize (e.g., Question + Answer).
 * @returns An array of numbers (768 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Sanitize input: remove newlines to optimize for the model
    const cleanText = text.replace(/\n/g, " ").trim();

    // Get or initialize Genkit instance (lazy initialization)
    const ai = getGenkitInstance();

    // Call the Genkit Embed function using the ai instance registry
    const result = await embed(ai.registry, {
      embedder: textEmbedding004,
      content: cleanText,
    });

    // The result is an array of objects with embedding property
    // Extract the embedding array from the first result
    if (result && result.length > 0 && result[0].embedding) {
      return result[0].embedding;
    }
    
    throw new Error("No embedding returned from Genkit");

  } catch (error) {
    logger.error("Vertex AI Embedding Error", error);
    // Throwing ensures the trigger knows it failed and can retry if configured
    throw new Error("Failed to generate embedding via Genkit.");
  }
}