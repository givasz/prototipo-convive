const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CONFIGURAÇÃO DE SEGURANÇA DO CORS---
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

app.post('/analyze', upload.single('resumeFile'), async (req, res) => {
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
        const prompt = `
            Você é uma coach de carreira especialista em RH. Sua tarefa é analisar o currículo de um candidato e recomendar os melhores cursos para seu perfil.

            **Cursos Disponíveis:**
            ${JSON.stringify(coursesData, null, 2)}

            **Currículo do Candidato:**
            ---
            ${resumeText}
            ---

            **Instruções MUITO IMPORTANTES:**
            1.  Crie um resumo positivo sobre o perfil do candidato no campo "profileSummary".
            2.  Para CADA curso da lista, avalie a adequação do candidato.
            3.  Sua resposta DEVE SER APENAS um objeto JSON válido.
            4.  Dentro da lista "recommendations", cada objeto DEVE OBRIGATORIAMENTE conter os seguintes campos: "courseTitle", "suitabilityScore" e "justification".
            5.  O campo "courseTitle" DEVE conter o nome exato do curso que está sendo analisado. NÃO omita este campo.

            Exemplo de formato OBRIGATÓRIO da resposta:
            {
                "profileSummary": "Seu perfil demonstra grande potencial na área de comunicação e liderança...",
                "recommendations": [
                    {
                        "courseTitle": "FORMAÇÃO GERENCIAL E LIDERANÇA",
                        "suitabilityScore": 95,
                        "justification": "Este curso é ideal para fortalecer suas habilidades de gestão."
                    }
                ]
            }
        `;

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