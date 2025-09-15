import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Modality } from '@google/genai';
import { RemovalResult } from '../../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set.');
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RemovalResult>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ text: `Method ${req.method} Not Allowed`, image: null });
  }

  const { base64ImageData, mimeType, userPrompt } = req.body;

  if (!base64ImageData || !mimeType || !userPrompt) {
    return res.status(400).json({ text: 'Missing required parameters', image: null });
  }

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
      return res.status(500).json({ text: 'The API returned an empty response.', image: null });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ text: `Failed to process image: ${errorMessage}`, image: null });
  }
}
