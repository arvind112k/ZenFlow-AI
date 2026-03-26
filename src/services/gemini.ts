import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SessionPreferences {
  goal: string;
  duration: number;
  level: string;
  voice?: string;
  background?: string;
}

export interface GeneratedSession {
  script: {
    timestamp: number;
    text: string;
    pose: string;
  }[];
  title: string;
  description: string;
}

export async function generateMeditationSession(prefs: SessionPreferences): Promise<GeneratedSession> {
  const prompt = `
    Generate a guided meditation and yoga session for a user with the following preferences:
    Goal: ${prefs.goal}
    Duration: ${prefs.duration} minutes
    Experience Level: ${prefs.level}

    The session should be a mix of breathing, gentle yoga poses, and mindfulness.
    Return a JSON object with:
    - title: A calming title
    - description: A brief overview
    - script: An array of steps, each with:
        - timestamp: seconds from start
        - text: the spoken instruction
        - pose: one of [mountain, tree, warrior1, warrior2, cobra, childs_pose, savasana, breathing]

    Ensure the total duration matches ${prefs.duration} minutes.
    The tone should be extremely calm and welcoming.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          script: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.NUMBER },
                text: { type: Type.STRING },
                pose: { type: Type.STRING }
              },
              required: ["timestamp", "text", "pose"]
            }
          }
        },
        required: ["title", "description", "script"]
      }
    }
  });

  return JSON.parse(response.text);
}
