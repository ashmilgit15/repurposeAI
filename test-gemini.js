
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY is not set. Run with: GROQ_API_KEY=your_key node test-gemini.js");
        return;
    }

    console.log("Testing Groq API with llama-3.3-70b-versatile...\n");

    try {
        const groq = new Groq.default({ apiKey });
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello, Groq is working!' in one sentence." }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 100,
        });

        console.log("SUCCESS! Groq response:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Error:", error.message || error);
    }
}

testGroq();
