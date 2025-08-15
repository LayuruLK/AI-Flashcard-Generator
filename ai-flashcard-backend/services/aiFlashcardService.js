const { ChatOpenAI } = require('@langchain/openai');

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
});

const generateFlashcardsFromText = async (text) => {
    const prompt = `
You are an AI that creates concise study flashcards.
Given the following content, generate 5 flashcards in JSON format:

Content: """${text}"""

Return ONLY valid JSON array in this format:
[
  { "question": "string", "answer": "string" }
]
Do NOT include any Markdown, code blocks, or extra text.
    `;

    const response = await model.invoke(prompt);

    // 1️⃣ Remove code blocks or extra Markdown
    let cleaned = response.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("AI JSON parse error:", err);
        console.error("AI raw response:", response.content);
        console.error("AI cleaned response:", cleaned);
        throw new Error("Invalid flashcard format from AI");
    }
};

module.exports = { generateFlashcardsFromText };
