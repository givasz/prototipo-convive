// netlify/functions/api.js (VERSÃO FINAL E ROBUSTA)

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const whitelist = [];
if (process.env.URL) { whitelist.push(process.env.URL); }
if (process.env.DEPLOY_PRIME_URL) { whitelist.push(process.env.DEPLOY_PRIME_URL); }
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
            } else { return res.status(400).json({ error: 'Formato de arquivo não suportado.' }); }
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
        
        // --- PROMPT REFINADO PARA SER MAIS DIRETO ---
        const prompt = `
            TAREFA: Analisar um currículo e gerar uma resposta JSON.
            
            CONTEXTO: Você é um sistema de análise de perfil profissional.
            
            CURSOS DISPONÍVEIS PARA RECOMENDAÇÃO:
            ${JSON.stringify(coursesData, null, 2)}

            CURRÍCULO DO CANDIDATO PARA ANÁLISE:
            ---
            ${resumeText}
            ---

            INSTRUÇÕES DE SAÍDA:
            1.  Crie um resumo de perfil positivo no campo "profileSummary".
            2.  Para CADA curso da lista, avalie a adequação e forneça uma pontuação de 0 a 100 no campo "suitabilityScore".
            3.  Forneça uma justificativa curta e positiva para cada recomendação no campo "justification".
            4.  Sua resposta DEVE SER ESTRITAMENTE um objeto JSON válido, sem nenhum texto ou comentário adicional antes ou depois.

            Exemplo de formato OBRIGATÓRIO da resposta:
            {
                "profileSummary": "Análise do perfil...",
                "recommendations": [
                    {
                        "courseTitle": "NOME_DO_CURSO",
                        "suitabilityScore": 95,
                        "justification": "Justificativa..."
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedText = response.text().replace(/^```json\s*|```\s*$/g, '').trim();

        // --- TRATAMENTO DE ERRO MELHORADO ---
        try {
            const parsedResult = JSON.parse(cleanedText);
            res.json(parsedResult);
        } catch (jsonError) {
            console.error("ERRO AO CONVERTER A RESPOSTA DA IA PARA JSON:", jsonError);
            console.error("TEXTO RECEBIDO DA IA QUE CAUSOU O ERRO:", cleanedText);
            res.status(500).json({ error: "A resposta da IA não estava no formato esperado (JSON)." });
        }

    } catch (error) {
        console.error("ERRO NA CHAMADA DA API GEMINI:", error);
        res.status(500).json({ error: "Ocorreu um erro na comunicação com o serviço de IA." });
    }
});

module.exports.handler = serverless(app);