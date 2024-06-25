// geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateContentFromImage = async (imagePath) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imageData = fs.readFileSync(imagePath);
    const result = await model.generateContent([
      'What is in this photo?',
      {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType: 'image/png',
        },
      },
    ]);
    return result.response.text();
  } catch (error) {
    console.error('Error generating content from image:', error);
    throw error;
  }
};

module.exports = {
  generateContentFromImage,
};
