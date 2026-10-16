import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function main() {
  console.log('A enviar pedido ao Gemini 4 Argon...');
  const response = await ai.models.generateContent({
    model: 'gemini-4-argon',
    contents: 'Confirme que esta resposta foi gerada pelo modelo Gemini 4 Argon.',
  });

  console.log('\n--- RESPOSTA RECEBIDA ---');
  console.log(response.text);
}

main().catch(console.error);
