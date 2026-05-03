const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-flash-latest");
  } catch (error) {
    console.error("Error with gemini-flash-latest:", error.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: "v1" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-pro (v1)");
  } catch (error) {
    console.error("Error with gemini-pro (v1):", error.message);
  }
}

listModels();
