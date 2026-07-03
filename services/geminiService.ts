import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client following coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalSupport = async (symptoms: string, vitals: string) => {
  try {
    // Use gemini-3-pro-preview for complex medical reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `En tant qu'assistant médical expert pour une clinique, analyse les données suivantes et propose des hypothèses diagnostiques et des examens complémentaires suggérés.
      Symptômes: ${symptoms}
      Signes vitaux: ${vitals}
      Réponds au format JSON structuré.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypotheses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste des hypothèses diagnostiques"
            },
            suggestedLabTests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Examens de laboratoire suggérés"
            },
            clinicalWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alerte de vigilance clinique (ex: signe de gravité)"
            }
          },
          required: ["hypotheses", "suggestedLabTests", "clinicalWarnings"]
        }
      }
    });
    
    // Access the text property directly as it is a getter
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erreur d'assistance clinique:", error);
    return null;
  }
};

export const transcribeMedicalAudio = async (base64Audio: string, mimeType: string = 'audio/webm') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Tu es un assistant médical. Transcris cet enregistrement audio médical exactement tel qu'il est dicté. Corrige uniquement les fautes d'orthographe évidentes des termes médicaux. Ne rajoute pas de commentaires."
          }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erreur de transcription:", error);
    return null;
  }
};