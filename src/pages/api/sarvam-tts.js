export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.body.text) {
    return res.status(400).json({ error: 'Text is required for TTS.' });
  }
  const { text } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY;
  try {
    const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        text,
        target_language_code: 'en-IN',
        speaker: 'anushka',
        model: 'bulbul:v2'
      }),
    });
    if (!sarvamRes.ok) {
      const err = await sarvamRes.text();
      return res.status(500).json({ error: err });
    }
    const data = await sarvamRes.json();
    res.status(200).json({ audios: data.audios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}