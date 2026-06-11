// import { jest } from "@jest/globals";

// // ============================================================================
// // MOCKS
// // ============================================================================

// const mockVisionPost: any = jest.fn();
// const mockTranslationPost: any = jest.fn();
// const mockGenerateContent: any = jest.fn();

// jest.unstable_mockModule("@azure-rest/ai-vision-image-analysis", () => ({
//   default: () => ({
//     path: () => ({
//       post: mockVisionPost,
//     }),
//   }),
// }));

// jest.unstable_mockModule("@azure-rest/ai-translation-text", () => ({
//   default: () => ({
//     path: () => ({
//       post: mockTranslationPost,
//     }),
//   }),
// }));

// jest.unstable_mockModule("@google/genai", () => ({
//   GoogleGenAI: class {
//     models = {
//       generateContent: mockGenerateContent,
//     };
//   },
//   Type: {
//     OBJECT: "OBJECT",
//     STRING: "STRING",
//   },
// }));

// const { processBookCoverAI } = await import("./aiScanner.service.js");

// describe("🤖 AI Scanner Service Unit Tests", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   // ==========================================================================
//   // ORIGINAL TESTS
//   // ==========================================================================

//   it("should process OCR + translation + Gemini successfully", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         analyzeResult: {
//           readResult: {
//             blocks: [
//               {
//                 lines: [
//                   { text: "Spitfire Author Name" },
//                   { text: "Epic Fantasy Novel Title" },
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [
//         {
//           translations: [{ text: "Spitfire Author Name" }],
//         },
//         {
//           translations: [{ text: "Epic Fantasy Novel Title" }],
//         },
//       ],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: JSON.stringify({
//         title: "Epic Fantasy Novel Title",
//         author: "Spitfire Author Name",
//       }),
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.success).toBe(true);
//     expect(result.title).toBe("Epic Fantasy Novel Title");
//     expect(result.author).toBe("Spitfire Author Name");
//     expect(result.alternativeLines).toHaveLength(2);
//   });

//   it("should return unknown values when OCR returns no text", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         analyzeResult: {
//           readResult: {
//             blocks: [],
//           },
//         },
//       },
//     });

//     const result = await processBookCoverAI(Buffer.from("empty"));

//     expect(result.success).toBe(false);
//     expect(result.title).toBe("Unknown Title");
//     expect(result.author).toBe("Unknown Author");
//   });

//   it("should fallback when translation and Gemini fail", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Messy Text Data" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockRejectedValue(
//       new Error("Translation Failed")
//     );

//     mockGenerateContent.mockRejectedValue(
//       new Error("Gemini Failed")
//     );

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.success).toBe(true);
//     expect(result.title).toBe("Rich Dad Poor Dad");
//     expect(result.author).toBe("Robert T. Kiyosaki");

//     expect(result.alternativeLines).toHaveLength(1);
//     expect(result.alternativeLines[0]!.originalText).toBe(
//       "Messy Text Data"
//     );
//   });

//   // ==========================================================================
//   // NEW TESTS
//   // ==========================================================================

//   it("should ignore blank OCR lines", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [
//                 { text: "" },
//                 { text: " " },
//                 { text: "Valid Book" },
//               ],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [{ translations: [{ text: "Valid Book" }] }],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: JSON.stringify({
//         title: "Valid Book",
//         author: "Author",
//       }),
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines).toHaveLength(1);
//   });

//   it("should fallback to original text when translation returns empty array", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Native Language Title" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: JSON.stringify({
//         title: "Native Language Title",
//         author: "Unknown",
//       }),
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines[0]!.translatedText)
//       .toBe("Native Language Title");
//   });

//   it("should handle partial translation results", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [
//                 { text: "Line 1" },
//                 { text: "Line 2" },
//               ],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [
//         {
//           translations: [{ text: "Translated Line 1" }],
//         },
//       ],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: JSON.stringify({
//         title: "Book",
//         author: "Author",
//       }),
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines[1]!.translatedText)
//       .toBe("Line 2");
//   });

//   it("should use fallback title when Gemini returns empty text", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book Line" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: "",
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.title).toBe("Rich Dad Poor Dad");
//   });

//   it("should use fallback author when Gemini returns empty text", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book Line" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: "",
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.author).toBe("Robert T. Kiyosaki");
//   });

//   it("should handle malformed Gemini JSON", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book Line" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: "{bad json}",
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.success).toBe(true);
//     expect(result.title).toBe("Rich Dad Poor Dad");
//   });

//   it("should assign yellow category to all extracted lines", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book Line" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: "",
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines[0]!.category)
//       .toBe("yellow");
//   });

//   it("should populate default reason text", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book Line" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: "",
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines[0]!.reason)
//       .toContain("Raw extracted");
//   });

//   it("should process multiple OCR blocks", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         readResult: {
//           blocks: [
//             {
//               lines: [{ text: "Book One" }],
//             },
//             {
//               lines: [{ text: "Author One" }],
//             },
//           ],
//         },
//       },
//     });

//     mockTranslationPost.mockResolvedValue({
//       body: [],
//     });

//     mockGenerateContent.mockResolvedValue({
//       text: JSON.stringify({
//         title: "Book One",
//         author: "Author One",
//       }),
//     });

//     const result = await processBookCoverAI(Buffer.from("image"));

//     expect(result.alternativeLines).toHaveLength(2);
//   });

//   it("should call Azure Vision once", async () => {
//     mockVisionPost.mockResolvedValue({
//       body: {
//         analyzeResult: {
//           readResult: {
//             blocks: [],
//           },
//         },
//       },
//     });

//     await processBookCoverAI(Buffer.from("image"));

//     expect(mockVisionPost).toHaveBeenCalledTimes(1);
//   });
// });