import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
    try {
        const response = await ai.models.list();
        // The response structure depends on the SDK version, let's log everything
        console.log(JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

list();
