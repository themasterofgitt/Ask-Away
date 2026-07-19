
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const getSpicyFollowUp = async (currentQuestion: string, category: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `We are playing a mysterious, elegant partner game called "Cartomancy of Curiosities" (fortune telling aesthetic, secrets, temptation). The current inquiry drawn from the deck is: "${currentQuestion}" from the suite "${category}". 
      Generate 1 thought-provoking follow-up question or observation (a 'scrying' moment) that deepens the conversation. 
      The tone should be sophisticated, mystical, slightly evocative, and deeply curious. 
      It should sound like an intimate tarot reading or a secret shared in a shadow-lit room.
      Avoid clichés and keep it elegant. Provide a short, potent inquiry.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            followUp: { type: Type.STRING, description: "The mystical follow-up prompt." },
            context: { type: Type.STRING, description: "Why this helps connection." }
          },
          required: ["followUp"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.followUp as string;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "What shadow lies beneath your answer? Unveil it for me.";
  }
};
