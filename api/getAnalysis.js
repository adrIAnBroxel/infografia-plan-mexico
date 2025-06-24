// Esta es tu función serverless para Vercel.
// Recibe la solicitud de tu página HTML, añade la clave de API secreta,
// y luego llama a la API de Google Gemini.

export default async function handler(req, res) {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        // Obtener el nombre del sector del cuerpo de la solicitud
        const { sector } = req.body;
        if (!sector) {
            return res.status(400).json({ error: 'Bad Request: Missing sector' });
        }

        // Obtener de forma segura la clave de API de las variables de entorno de Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server error: API key not configured.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const prompt = `Actúa como un consultor de estrategia económica de alto nivel. Para el sector '${sector}' dentro del marco del 'Plan México', genera un análisis conciso y ejecutivo. El análisis debe incluir los siguientes puntos, formateados claramente con títulos: 1. **Principales Oportunidades:** Enfócate en nearshoring, innovación y cadenas de valor. 2. **Riesgos Clave:** Identifica los principales desafíos internos y externos a mitigar. 3. **Acciones Estratégicas Sugeridas:** Propón 3 acciones concretas y de alto impacto para maximizar el potencial del sector. Usa un lenguaje claro, directo y profesional.`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        // Llamar a la API de Gemini desde la función serverless
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            return res.status(response.status).json({ error: `Gemini API request failed: ${errorBody}` });
        }

        const result = await response.json();
        
        // Devolver la respuesta de la API de Gemini a la página HTML
        res.status(200).json(result);

    } catch (error) {
        console.error('Function Error:', error);
        res.status(500).json({ error: 'An internal error occurred.' });
    }
}
