import { GoogleGenAI } from '@google/genai';
import { tasiKnowledge } from '@/data/tasi-knowledge';
import { protectPublicPostRoute } from '@/lib/api-security';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const CHAT_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 2000;
const chatCache = new Map<string, { reply: string; expiresAt: number }>();

function stableHash(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function normalizeMessages(messages: unknown) {
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES
  ) {
    throw new Error('Invalid messages format');
  }

  return messages.map((msg: any) => {
    const role =
      msg?.role === 'assistant' || msg?.role === 'model' ? 'assistant' : 'user';
    const content = typeof msg?.content === 'string' ? msg.content.trim() : '';
    if (!content || content.length > MAX_MESSAGE_CHARS) {
      throw new Error('Each message must be 1-2000 characters.');
    }
    return { role, content };
  });
}

function getCachedReply(key: string) {
  const cached = chatCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    chatCache.delete(key);
    return null;
  }
  return cached.reply;
}

function setCachedReply(key: string, reply: string) {
  chatCache.set(key, { reply, expiresAt: Date.now() + CHAT_CACHE_TTL_MS });
  if (chatCache.size > 500) {
    const firstKey = chatCache.keys().next().value;
    if (firstKey) chatCache.delete(firstKey);
  }
}

export async function POST(req: Request) {
  const protection = await protectPublicPostRoute(req, 'chat', {
    windowMs: 60 * 1000,
    maxRequests: 12,
  });

  if (!protection.ok) {
    return protection.response;
  }

  const rateLimitHeaders = 'headers' in protection ? protection.headers : {};

  try {
    const { messages: rawMessages } = await req.json();
    const messages = normalizeMessages(rawMessages);
    const cacheKey = `chat:${stableHash(messages)}`;
    const cachedReply = getCachedReply(cacheKey);
    if (cachedReply) {
      return Response.json(
        { reply: cachedReply, cached: true },
        {
          headers: {
            ...rateLimitHeaders,
            'Cache-Control': 'private, max-age=300',
          },
        }
      );
    }

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set.');
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }

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
    if (reply) setCachedReply(cacheKey, reply);

    return Response.json(
      { reply, cached: false },
      {
        headers: {
          ...rateLimitHeaders,
          'Cache-Control': 'private, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
