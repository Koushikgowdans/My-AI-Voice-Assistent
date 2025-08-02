import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-US";

function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("notes")) || []);
  const [reminders, setReminders] = useState(() => JSON.parse(localStorage.getItem("reminders")) || []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [notes, reminders]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const playAlarm = () => {
    const audio = new Audio("/alarm.mp3");
    audio.play();
  };

  const askChatGPT = async (query) => {
    try {
      const res = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }]
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer your key` // Replace with your real API key
        }
      });
      const reply = res.data.choices[0].message.content;
      setResponse(reply);
      speak(reply);
    } catch (error) {
      console.error("ChatGPT error:", error);
      speak("Sorry, ChatGPT lookup failed.");
    }
  };

  const openDesktopApp = async (app) => {
    try {
      await axios.post("http://localhost:5000/open-app", { app });
      speak(`Opening ${app}`);
    } catch (err) {
      console.error(err);
      speak("Sorry, I couldn't open that application.");
    }
  };

  const handleCommand = (text) => {
    const command = text.toLowerCase();

    if (command.includes("hello")) {
      const res = "Hi there!";
      setResponse(res);
      speak(res);

    } else if (command.includes("what's the time") || command.includes("what is the time")) {
      const now = new Date();
      const res = "Current time is: " + now.toLocaleTimeString();
      setResponse(res);
      speak(res);

    } else if (command.includes("open google")) {
      const res = "Opening Google...";
      setResponse(res);
      speak(res);
      window.open("https://google.com", "_blank");

    } else if (command.includes("open youtube")) {
      const res = "Opening YouTube...";
      setResponse(res);
      speak(res);
      window.open("https://www.youtube.com", "_blank");

    } else if (command.includes("open instagram")) {
      const res = "Opening Instagram...";
      setResponse(res);
      speak(res);
      window.open("https://www.instagram.com", "_blank");

    } else if (command.includes("open facebook")) {
      const res = "Opening Facebook...";
      setResponse(res);
      speak(res);
      window.open("https://www.facebook.com", "_blank");

    } else if (command.includes("open whatsapp")) {
      const res = "Opening WhatsApp...";
      setResponse(res);
      speak(res);
      window.open("https://web.whatsapp.com", "_blank");

    } else if (command.includes("open messages on instagram")) {
      const res = "Opening messages on Instagram...";
      setResponse(res);
      speak(res);
      window.open("https://www.instagram.com/direct/inbox/", "_blank");

    } else if (command.startsWith("search ")) {
      const query = command.replace("search ", "").trim();
      const res = `Searching for ${query} on Google`;
      setResponse(res);
      speak(res);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");

    } else if (command.startsWith("take a note")) {
      const note = command.replace("take a note", "").trim();
      const updated = [...notes, note];
      setNotes(updated);
      speak("Note saved.");

    } else if (command.startsWith("remind me to")) {
      const match = command.match(/remind me to (.+) in (\d+) (seconds|minutes)/);
      if (match) {
        const task = match[1];
        const time = parseInt(match[2]);
        const unit = match[3];
        const ms = unit === "minutes" ? time * 60000 : time * 1000;
        const updated = [...reminders, task];
        setReminders(updated);
        speak(`Reminder set for ${task} in ${time} ${unit}`);
        setTimeout(() => {
          speak(`Reminder: ${task}`);
          playAlarm();
        }, ms);
      } else {
        const reminder = command.replace("remind me to", "").trim();
        const updated = [...reminders, reminder];
        setReminders(updated);
        speak("Reminder added.");
      }

    } else if (command.startsWith("ask chatgpt")) {
      const query = command.replace("ask chatgpt", "").trim();
      if (query) {
        speak("Let me ask ChatGPT...");
        askChatGPT(query);
      } else {
        speak("What should I ask ChatGPT?");
      }

    } else if (command.startsWith("launch") || command.startsWith("open")) {
      const app = command.replace("launch", "").replace("open", "").trim();
      openDesktopApp(app);

    } else if (command.includes("clear notes")) {
      setNotes([]);
      speak("All notes cleared.");

    } else if (command.includes("clear reminders")) {
      setReminders([]);
      speak("All reminders cleared.");

    } else if (command.includes("who created you")) {
      const res = "I was created by Koushik using React and Node.";
      setResponse(res);
      speak(res);

    } else {
      const res = "Command not recognized.";
      setResponse(res);
      speak(res);
    }
  };

  const startListening = () => {
    if (!listening) {
      setListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex][0].transcript;
    setTranscript((prev) => prev + " " + result);
    handleCommand(result);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    speak("Speech recognition error occurred.");
  };

  return (
    <div className="container">
      <h1>🧠 AI Voice Assistant</h1>
      <button onClick={startListening} disabled={listening}>🎙️ Start Listening</button>
      <button onClick={stopListening} disabled={!listening}>🛑 Stop Listening</button>

      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>Assistant:</strong> {response}</p>

      <h2>📝 Notes</h2>
      <ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>

      <h2>⏰ Reminders</h2>
      <ul>{reminders.map((r, i) => <li key={i}>{r}</li>)}</ul>

      <footer style={{ marginTop: "2rem", fontSize: "14px", color: "#888" }}>
        Built by Koushik — powered by React, ChatGPT & Node
      </footer>
    </div>
  );
}

export default App;
