import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export const generateGiftDescription = async (giftName: string): Promise<string> => {
  try {
    const ai = getAIClient();
    if (!ai) return "Configura la API Key para usar IA.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Actúa como un experto en productos. Describe de forma técnica y persuasiva: "${giftName}". Máximo 3 frases.`,
    });

    return response.text || "No se pudo generar una descripción.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hubo un error al contactar con la IA.";
  }
};

export const improveDescription = async (currentText: string): Promise<string> => {
  try {
    const ai = getAIClient();
    if (!ai) return currentText;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Mejora el siguiente texto para que sea más emocionante y venda mejor el producto, manteniendo la longitud similar: "${currentText}"`,
    });

    return response.text || currentText;
  } catch (error) {
    return currentText;
  }
};

export const suggestGiftIdeas = async (interests: string): Promise<string[]> => {
  try {
    const ai = getAIClient();
    if (!ai) return ["Error de configuración API"];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Sugiere 3 regalos concretos para alguien a quien le gusta: "${interests}". 
      Devuelve SOLO una lista separada por comas, sin numeración ni explicaciones extra. 
      Ejemplo: Auriculares Sony, Zapatillas Nike, Libro de Cocina`,
    });

    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    return ["No se pudieron generar ideas."];
  }
};