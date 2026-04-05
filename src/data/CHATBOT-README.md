# TASI 2026 Chatbot

## How to update chatbot knowledge
1. Open \`/src/data/tasi-knowledge.ts\`
2. Edit the text inside the template literal
3. Save the file — no redeploy needed in dev, redeploy on Vercel for production

## How to get Gemini API key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Add to \`.env.local\` as \`GEMINI_API_KEY=your_key\`

## Free tier limits
- 15 requests per minute
- 1 million tokens per day
- No credit card required

## To improve answers
- Add more detail to \`tasi-knowledge.ts\`
- Add specific FAQs you receive by email
- Keep speaker bios and schedule updated
