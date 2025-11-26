import { GoogleGenAI } from "@google/genai";
import { UWEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPlanningAdvice = async (
  currentEvents: UWEvent[],
  proposedTitle: string,
  proposedDescription: string,
  proposedDate: string
): Promise<string> => {
  try {
    const eventContext = currentEvents
      .filter(e => e.date === proposedDate)
      .map(e => `- ${e.title} (${e.startTime}-${e.endTime}) by ${e.organizer}: ${e.tags.join(', ')}`)
      .join('\n');

    const prompt = `
      You are an expert event planner for the University of Washington. 
      An RSO is planning a new event: "${proposedTitle}" on ${proposedDate}.
      Description: "${proposedDescription}".
      
      Here are other events happening on that same day:
      ${eventContext || "No other events scheduled for this day yet."}

      Please provide brief advice (max 3 sentences) on:
      1. Potential thematic clashes (e.g., too many career events).
      2. Suggestions to make the event stand out based on the description.
      3. If the schedule looks clear, encourage them!
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI assistant is currently offline. Please rely on the visual schedule.";
  }
};

export const generateMarketingContent = async (
  title: string,
  organizer: string,
  date: string,
  startTime: string,
  location: string,
  description: string,
  tags: string[],
  type: 'email' | 'social' | 'flyer'
): Promise<string> => {
  try {
    const prompt = `
      Act as a hype-man and marketing chair for a registered student organization (RSO) at the University of Washington.
      
      Create content for: ${type === 'email' ? 'A newsletter email to members' : type === 'social' ? 'An Instagram/Twitter post' : 'A printed flyer headline and body'}
      
      Event Details:
      - Event: ${title} hosted by ${organizer}
      - When: ${date} @ ${startTime}
      - Where: ${location}
      - What: ${description}
      - Perks/Tags: ${tags.join(', ')}
      
      Tone: Exciting, inclusive, and urgent. Use emojis where appropriate.
      
      IMPORTANT: Return ONLY plain text. Do NOT use Markdown (no bolding **, no headers #, etc). Just standard text paragraphs.
      
      ${type === 'social' ? 'Include relevant hashtags for UW students (e.g. #huskies, #udub).' : ''}
      ${type === 'email' ? 'Subject line should be catchy.' : ''}
      ${type === 'flyer' ? 'Keep it punchy and short. Focus on the hook.' : ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate marketing content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI marketing assistant is offline.";
  }
};

export const generateFlyerImage = async (
  title: string,
  description: string,
  tags: string[]
): Promise<string | null> => {
  try {
    const prompt = `
      Create a vibrant, high-quality event flyer graphic for a University of Washington student event.
      Event Title: ${title}
      Theme: ${description}
      Vibe: ${tags.join(', ')}
      Style: Modern, colorful, collegiate, flat vector illustration style. 
      Do not include text on the image, just the art.
    `;

    // Using gemini-2.5-flash-image as per guidelines for general image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};
