import { GoogleGenAI, Modality } from "@google/genai";
import { RemovalResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const createPrompt = (userPrompt: string) => `
You are an expert image processing specialist focused on inpainting and object removal. Your task is to remove the object or imperfection described by the user from the provided image.

**User's Request:** "${userPrompt}"

**Instructions:**
1.  **Analyze and Remove:** Carefully identify and completely remove the element described in the user's request.
2.  **Reconstruct:** Use advanced inpainting algorithms to perfectly reconstruct the background occluded by the removed object. The result should be seamless and natural.
3.  **Preserve Quality:** Maintain the original high-definition quality. Ensure no visual artifacts, distortions, or compression artifacts are introduced. Preserve all original image details, colors, and textures.
4.  **Output:** Provide only the clean, edited image as the output. Do not add any text response unless you are unable to process the image.

**Critical Warning:** The final image must look natural and un-edited. The reconstruction of the background must be flawless.
`;


export const removeObjectFromImage = async (
  base64ImageData: string,
  mimeType: string,
  userPrompt: string
): Promise<RemovalResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: createPrompt(userPrompt),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: RemovalResult = { image: null, text: null };

    if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                result.image = part.inlineData.data;
            } else if (part.text) {
                result.text = part.text;
            }
        }
    }
    
    if (!result.image && !result.text) {
        throw new Error("The API returned an empty response.");
    }
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image processing.");
  }
};