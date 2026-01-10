
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in .env.local");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // User mentioned "2.0-flash" (referred as 2.5 flash)
        const name = "gemini-.5-flash";
        console.log(`\nTesting model: ${name}`);

        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Say 'test' in one word.");
        const response = await result.response;
        console.log(`Success with ${name}:`, response.text());
    } catch (error) {
        console.error("Error calling Gemini API:");
        console.error(error.message || error);
    }
}

testGemini();
