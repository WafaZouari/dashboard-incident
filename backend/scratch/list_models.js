// Node 22 has global fetch
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      const geminiModels = data.models
        .filter(m => m.name.includes("gemini"))
        .map(m => m.name);
      console.log("Gemini Models:", JSON.stringify(geminiModels, null, 2));
    } else {
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
