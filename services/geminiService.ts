
import { GoogleGenAI } from "@google/genai";
import { Holding } from "../types";

export const getQuantReport = async (holdings: Holding[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const portfolioData = holdings.map(h => 
    `Asset: ${h.symbol} | Value: $${h.value.toFixed(2)} | ROI: ${h.pnlPercent.toFixed(2)}% | Alloc: ${h.allocation.toFixed(2)}%`
  ).join('\n');

  const prompt = `
    Analyze this professional crypto portfolio:
    ${portfolioData}

    Provide an institutional-grade report including:
    1. Risk Assessment (Low/Medium/High/Extreme).
    2. Asset Concentration Warning.
    3. Rebalancing Strategy (Specific buy/sell suggestions).
    4. Sentiment Analysis of the current mix.

    Return the report in strictly JSON format:
    {
      "riskLevel": string,
      "concentrationRisk": string,
      "rebalanceStrategy": string,
      "marketOutlook": string,
      "confidenceScore": number
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Advisor Error:", error);
    return null;
  }
};
