let mediaRecorder;
let audioChunks = [];

document.getElementById("mic-btn").onclick = () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const chat = document.getElementById("chat-bot");

      try {
        const response = await fetch('http://localhost:5000/speech-to-text', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        console.log("🗣️ Transcription:", data.text);

        if (data.text) {
          chat.addMessage({ role: 'user', text: data.text });
        } else {
          chat.addMessage({ role: 'user', text: "[No transcription received]" });
        }

        audioChunks = [];

      } catch (error) {
        console.error("❌ Fetch failed:", error);
        chat.addMessage({ role: 'user', text: "[Error: " + error.message + "]" });
      }
    };

    mediaRecorder.start();
    console.log("🔴 Recording started...");
    setTimeout(() => {
      mediaRecorder.stop();
      console.log("🟢 Recording stopped.");
    }, 4000);
  }).catch(err => {
    alert("Microphone access denied.");
    console.error("❌ Mic error:", err);
  });
};
