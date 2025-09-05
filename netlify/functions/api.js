const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const whitelist = [];
if (process.env.URL) { 
    whitelist.push(process.env.URL);
}
if (process.env.DEPLOY_PRIME_URL) {
    whitelist.push(process.env.DEPLOY_PRIME_URL);
}
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido por CORS'));
        }
    }
};
app.use(cors(corsOptions));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const coursesData = [
    { title: "Atendimento que Vende: Os 07 Passos do Sucesso no Comércio" },
    { title: "Imersão em PNL: Programação Neurolinguística" },
    { title: "Método Venda +: Estratégias Comerciais Avançadas" },
    { title: "Imersão em Oratória & Comunicação – A Vibração que Transforma" },
    { title: "Oficina de Gestão Estratégica de Pessoas" },
    { title: "FORMAÇÃO GERENCIAL E LIDERANÇA" }
];

app.post('/api/analyze', upload.single('resumeFile'), async (req, res) => {
    let resumeText = req.body.resume;
    if (req.file) {
        try {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(req.file.buffer);
                resumeText = data.text;
            } else if (req.file.mimetype === 'text/plain') {
                resumeText = req.file.buffer.toString('utf-8');
            } else {
                return res.status(400).json({ error: 'Formato de arquivo não suportado.' });
            }
        } catch (fileError) {
            console.error("Erro ao ler o arquivo:", fileError);
            return res.status(500).json({ error: "Não foi possível processar o arquivo enviado." });
        }
    }
    if (!resumeText || resumeText.trim() === '') {
        return res.status(400).json({ error: 'Nenhum currículo foi enviado.' });
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Você é uma coach de carreira especialista em RH... (seu prompt aqui)`; // Mantém seu prompt
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
        const parsedResult = JSON.parse(cleanedText);
        res.json(parsedResult);
    } catch (error) {
        console.error("ERRO NO BACKEND:", error);
        res.status(500).json({ error: "Ocorreu um erro no servidor ao analisar o currículo." });
    }
});

module.exports.handler = serverless(app);