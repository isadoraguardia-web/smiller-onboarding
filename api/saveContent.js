// Vercel Function para salvar conteúdo no GitHub de forma segura
// O token é guardado em variável de ambiente, não no código

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'isadoraguardia-web/smiller-onboarding';

export default async (req, res) => {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { content } = req.body;

        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: 'GitHub token não configurado' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Conteúdo não fornecido' });
        }

        // Get current file SHA
        let sha = null;
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${REPO}/contents/content.json`,
                {
                    headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
                }
            );

            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
        } catch (e) {
            console.log('File not found yet, will create new');
        }

        // Upload to GitHub
        const updatePayload = {
            message: `[Admin] Atualização de conteúdo - ${new Date().toLocaleString('pt-BR')}`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            branch: 'main'
        };

        if (sha) {
            updatePayload.sha = sha;
        }

        const updateResponse = await fetch(
            `https://api.github.com/repos/${REPO}/contents/content.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            }
        );

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Erro ao salvar');
        }

        res.status(200).json({ success: true, message: 'Conteúdo salvo com sucesso' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
