
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChannelInsight = async (channelName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief 1-sentence summary of what this TV channel is about: "${channelName}". Return as plain text in Arabic.`,
    });
    return response.text;
  } catch (error) {
    return "معلومات القناة غير متوفرة حالياً.";
  }
};
