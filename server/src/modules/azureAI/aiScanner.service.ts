import { AzureKeyCredential } from "@azure/core-auth";
import AzureVisionModule from "@azure-rest/ai-vision-image-analysis";
import createTextTranslationClient from "@azure-rest/ai-translation-text";
import { GoogleGenAI, Type } from "@google/genai";

const aiKey = process.env.AZURE_AI_KEY || "";
const aiEndpoint = process.env.AZURE_AI_ENDPOINT || "";
const aiRegion = process.env.AZURE_AI_REGION || "centralindia";
const geminiApiKey = process.env.GEMINI_API_KEY || "";

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

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export const processBookCoverAI = async (imageBuffer: Buffer) => {
  // STEP 1: Global Azure Vision OCR Scan
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

  // STEP 2: Azure Translation Bulk Normalization
  const translationInputs = extractedLines.map(line => ({ text: line, targets: [{ language: "en" }] }));
  let englishLines: string[] = [...extractedLines];
  let azureDetectedLangCode = "en"; 

  if (extractedLines.length > 0) {
    try {
      const translateResponse = await translationClient.path("/translate").post({
        body: { inputs: translationInputs }
      });
      const translationData = translateResponse.body as any;
      if (Array.isArray(translationData)) {
        englishLines = extractedLines.map((rawLine, index) => {
          if (translationData[index]?.detectedLanguage?.language && translationData[index].detectedLanguage.language !== "en") {
            azureDetectedLangCode = translationData[index].detectedLanguage.language;
          }
          return translationData[index]?.translations?.[0]?.text || rawLine;
        });
      }
    } catch (err) {
      console.error("Translation Layer Failed:", err);
    }
  }

  const textContextPayload = extractedLines.map(
    (raw, idx) => `- OCR Extracted: "${raw}" | Translated Target: "${englishLines[idx] || raw}"`
  ).join("\n");

  // STEP 3: Gemini Multimodal Vision & Contextual Verification
  let bestTitle = "";
  let bestAuthor = "";
  let bestLanguage = "";
  let detectedCategory = "Non-Fiction";
  let overviewText = "";

  try {
  const systemInstruction = 
    "You are an expert global library management automation engine. Your job is to accurately extract structural properties and analyze contextual metadata from a book cover.\n\n" +
    "CRITICAL CORRECTION & EXTRACTION RULES:\n" +
    "1. You are provided BOTH an OCR transcript string and the direct raw book cover image.\n" +
    "2. If the OCR transcript contains gibberish or misspelled text due to script misidentification, analyze the image directly to visually verify the original characters, author name, and correct language.\n" +
    "3. Return Title and Author in clean English Title Case format. Identify and return the true, full native language name capitalized dynamically based on the source material.\n" +
    "4. CATEGORY RULES: Classify the book into exactly ONE generic core global category name that best reflects its actual shelf classification in modern library standards globally. Do not restrict yourself to a predefined list—accurately capture the true primary vertical of the book.\n" +
    "5. OVERVIEW PANEL RULES: Generate a clean, highly readable layout for the librarian. Do not write a continuous block of mixed paragraphs. Instead, format the text explicitly into the following structure:\n" +
    "   - Book Name: [True Title]\n" +
    "   - Author Name: [True Author Name]\n" +
    "   - Book Published Year: [Original Publication Year or Estimated Era]\n" +
    "   - Genre: [Specific structural sub-genre tag]\n" +
    "   - Global Readers: [Brief indicator of its readership status, impact, or global distribution market]\n" +
    "   - Native Language: [The original language of publication]\n" +
    "   \n" +
    "   Summary:\n" +
    "   [Provide a standalone, engaging 2-to-3 line objective description about the book content, plot, or core thesis alone.]";

   const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg"
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        imagePart,
        `Azure AI Detected Code Hint: ${azureDetectedLangCode}\n\nExtracted Line Text Metadata:\n${textContextPayload}\n\nAnalyze the image and structural text details to resolve the attributes.`
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Definitive book title in English Title Case." },
            author: { type: Type.STRING, description: "Definitive primary author name in English Title Case." },
            language: { type: Type.STRING, description: "Full capitalized language string name (e.g., 'Japanese', 'Kannada')." },
            category: { type: Type.STRING, description: "A single broad category categorization tag (e.g., 'Money', 'Fiction', 'Self-Help')." },
            overview: { type: Type.STRING, description: "A comprehensive, 3 to 4 lines description summary context about the book and author." }
          },
          required: ["title", "author", "language", "category", "overview"],
        },
      },
    });

    const responseText = response.text ? response.text.trim() : "";
    if (responseText) {
      const parsedLLMResult = JSON.parse(responseText);
      bestTitle = parsedLLMResult.title;
      bestAuthor = parsedLLMResult.author;
      bestLanguage = parsedLLMResult.language;
      detectedCategory = parsedLLMResult.category;
      overviewText = parsedLLMResult.overview;
    }
  } catch (llmError) {
    console.error("Gemini Multimodal Reasoning Layer Crash:", llmError);
  }

  return {
    success: true,
    title: bestTitle || "Unknown Title", 
    author: bestAuthor || "Unknown Author",
    language: bestLanguage || "English",
    category: detectedCategory || "Unknown Category",
    overview: overviewText || "No overview available for this item."
  };
};