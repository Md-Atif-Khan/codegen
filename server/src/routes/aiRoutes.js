import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

router.post('/suggest', async (req, res) => {
  const { methodName, returnType, params, description } = req.body;

  try {
    const prompt = `Generate a function definition in c++ for a method named ${methodName} with return type ${returnType} and parameters ${params}. Description: ${description}. Provide the response as a JSON object with a 'suggestion' field.`;

    const result = await model.generateContent(prompt);
    const generated = await result.response.text();
    const generatedJSON = JSON.parse(generated);

    const fullMethod = generatedJSON.suggestion;
    const bodyContent = fullMethod.substring(
      fullMethod.indexOf('{') + 1,
      fullMethod.lastIndexOf('}')
    ).trim();

    res.json({ suggestion: bodyContent });
  } catch (error) {
    console.error('Error generating method suggestion:', error);
    res.status(500).json({ error: 'Error generating method suggestion', details: error.message });
  }
});

export default router;
