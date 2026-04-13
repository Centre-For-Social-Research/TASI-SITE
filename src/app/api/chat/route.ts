import { GoogleGenAI } from '@google/genai';
import { tasiKnowledge } from '@/data/tasi-knowledge';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set.');
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // TODO: Add rate limiting before production

    const systemInstruction = `You are the official AI assistant for TASI 2026 conference in New Delhi.
Answer questions ONLY based on the TASI 2026 information provided below.
If the answer is not in the provided information, respond with:
'I don't have that detail yet. Please reach out to us at [contact email].'
Never make up facts, dates, names, or figures.
Keep answers concise, friendly, and professional.
Always refer to the event as TASI 2026.

Here is the TASI 2026 information:
${tasiKnowledge}`;

    const rawHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Enforce strict alternation and ensure history starts with 'user'
    const history: any[] = [];
    let lastRole = '';
    for (const msg of rawHistory) {
      if (msg.role !== lastRole) {
        history.push(msg);
        lastRole = msg.role;
      } else if (history.length > 0) {
        history[history.length - 1].parts[0].text += '\n' + msg.parts[0].text;
      }
    }

    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const lastMessage = messages[messages.length - 1].content;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      history,
    });

    const result = await chat.sendMessage({ message: lastMessage });
    const reply = result.text;

    return Response.json({ reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
