export default async function handler(req, res) {
      if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed' });
      }

    try {
              const token = process.env.GITHUB_TOKEN;
              const owner = 'isadoraguardia-web';
              const repo = 'smiller-onboarding';
              const path = 'content.json';

          // Fetch content.json from GitHub
          const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            {
                              headers: {
                                                    'Authorization': `token ${token}`,
                                                    'Accept': 'application/vnd.github.v3.raw'
                              }
            }
                    );

          if (!response.ok) {
                        // Se arquivo não existe, retorna conteúdo vazio
                  if (response.status === 404) {
                                    return res.status(200).json({});
                  }
                        throw new Error(`GitHub API error: ${response.status}`);
          }

          const content = await response.json();
              res.status(200).json(content);
    } catch (error) {
              console.error('Error loading content:', error);
              res.status(200).json({}); // Retorna vazio se houver erro, para não quebrar o painel
    }
}
