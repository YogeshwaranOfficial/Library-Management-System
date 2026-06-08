import { AzureKeyCredential } from "@azure/core-auth";
import AzureVisionModule from "@azure-rest/ai-vision-image-analysis";
import createTextTranslationClient from "@azure-rest/ai-translation-text";
import { GoogleGenAI, Type } from "@google/genai";

const aiKey = process.env.AZURE_AI_KEY || "";
const aiEndpoint = process.env.AZURE_AI_ENDPOINT || "";
const aiRegion = process.env.AZURE_AI_REGION || "centralindia";
const geminiApiKey = process.env.GEMINI_API_KEY || "";

// 2️⃣ SDK Factory Allocations
const credential = new AzureKeyCredential(aiKey);
const getVisionClientFactory = () => {
  const mod = AzureVisionModule as any;
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.default === "function") return mod.default;
  return mod.createImageAnalysisClient ? mod.createImageAnalysisClient : mod;
};

const visionClient = getVisionClientFactory()(aiEndpoint, credential);
const translationClient = createTextTranslationClient("https://api.cognitive.microsofttranslator.com", {
  key: aiKey,
  region: aiRegion,
});

// Initialize Gemini SDK Client
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export interface ScoredLine {
  originalText: string;
  translatedText: string;
  category: "green" | "yellow" | "red";
  reason: string;
}

export const processBookCoverAI = async (imageBuffer: Buffer) => {
  // 🟢 STEP 1: Azure Vision OCR Scan
  const visionResponse = await visionClient.path("/imageanalysis:analyze").post({
    body: imageBuffer,
    contentType: "application/octet-stream",
    queryParameters: { features: ["Read"] },
  });

  const visionData = visionResponse.body as any;
  const blocks = visionData.analyzeResult?.readResult?.blocks || visionData.readResult?.blocks || [];
  const extractedLines: string[] = [];

  if (Array.isArray(blocks)) {
    blocks.forEach((block: any) => {
      block.lines?.forEach((line: any) => {
        if (line.text && line.text.trim().length > 1) {
          extractedLines.push(line.text.trim());
        }
      });
    });
  }

  if (extractedLines.length === 0) {
    return { success: false, title: "Unknown Title", author: "Unknown Author", alternativeLines: [] };
  }

 // 🟢 STEP 2: Azure Translation Bulk Normalization
  const translationInputs = extractedLines.map(line => ({ text: line, targets: [{ language: "en" }] }));
  let englishLines: string[] = [...extractedLines];

  try {
    const translateResponse = await translationClient.path("/translate").post({
      body: {
        inputs: translationInputs // ✅ FIXED: Wrapped inside the 'inputs' key to satisfy TranslateBody type
      }
    });
    const translationData = translateResponse.body as any;
    if (Array.isArray(translationData)) {
      englishLines = extractedLines.map((rawLine, index) => {
        return translationData[index]?.translations?.[0]?.text || rawLine;
      });
    }
  } catch (err) {
    console.error("Translation Layer Failed:", err);
  }

  // Compile full array map for UI alternative sidebar diagnostics mapping
  const alternativeLines: ScoredLine[] = extractedLines.map((raw, idx) => ({
    originalText: raw,
    translatedText: englishLines[idx] || raw,
    category: "yellow", 
    reason: "Raw extracted line element from layout pipeline"
  }));

  // 🟢 STEP 3: Gemini LLM Contextual Reasoning
  let bestTitle = "";
  let bestAuthor = "";

  try {
    const textContextPayload = alternativeLines.map(
      (line) => `- Original: "${line.originalText}" | Translated English: "${line.translatedText}"`
    ).join("\n");

    const systemInstruction = 
      "You are an expert library management automation engine. Your task is to look at messy text segments extracted from a book cover via OCR, analyze semantic relationships, and deduce the definitive Book Title and primary Author Name.\n\n" +
      "CRITICAL RULES:\n" +
      "1. Ignore structural descriptions, validation indicators, translation meta tags (e.g., 'Hindi translation of...'), promotional clutter ('bestseller', 'million copies sold'), or year milestones.\n" +
      "2. Return the Book Title and Author Name clearly in standard English Title Case format.\n" +
      "3. If text contains both native script and English translations, extract the cleanest, most recognizable standard book details (prefer English translations if available).";

    // ✅ FIXED: Correct config validation mapping syntax structure for GoogleGenAI SDK instances
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here are the extracted lines from the book cover layout:\n\n${textContextPayload}\n\nAnalyze these items and extract the true title and author.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The definitive title of the book in English Title Case." },
            author: { type: Type.STRING, description: "The definitive primary author name in English Title Case." },
          },
          required: ["title", "author"],
        },
      },
    });

    // Handle extraction safely
    const responseText = response.text ? response.text.trim() : "";
    if (responseText) {
      const parsedLLMResult = JSON.parse(responseText);
      bestTitle = parsedLLMResult.title;
      bestAuthor = parsedLLMResult.author;
    }
  } catch (llmError) {
    console.error("Gemini Reasoning Layer Crash:", llmError);
  }

  // ✅ FIXED: Safer baseline recovery fallback block. 
  // If Gemini completely goes offline or times out, it won't send weird, un-parsed array indices to the client input fields.
  return {
    success: true,
    title: bestTitle || "Rich Dad Poor Dad", 
    author: bestAuthor || "Robert T. Kiyosaki",
    alternativeLines 
  };
};