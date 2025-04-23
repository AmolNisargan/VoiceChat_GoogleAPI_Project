const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const speech = require('@google-cloud/speech');

const app = express();
const port = 5000;

app.use(cors());
const upload = multer({ dest: 'uploads/' });

const client = new speech.SpeechClient({
  keyFilename: 'google-credentials.json',
});

app.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  const audioBytes = fs.readFileSync(req.file.path).toString('base64');

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    },
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n');
    res.json({ text: transcription });
  } catch (error) {
    console.error("Speech API error:", error);
    res.status(500).send('Speech recognition failed');
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
