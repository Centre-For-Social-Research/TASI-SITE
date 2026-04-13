import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function main() {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Be brief.',
    },
    history: [
      { role: 'user', parts: [{ text: 'hi' }] },
      { role: 'model', parts: [{ text: 'hello' }] },
    ],
  });

  const res = await chat.sendMessage({ message: 'who are you?' });
  console.log(res.text);
}

main().catch(console.error);
