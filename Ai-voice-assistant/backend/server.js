const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/open-app", (req, res) => {
  const appName = req.body.app.toLowerCase();
  let command = "";

  if (appName.includes("vs code") || appName.includes("vscode")) {
    command = "code";
  } else if (appName.includes("notepad")) {
    command = "notepad";
  } else if (appName.includes("calculator")) {
    command = "calc";
  } else {
    return res.status(400).json({ error: "App not supported" });
  }

  exec(command, (err) => {
    if (err) {
      console.error("Failed to open:", err);
      return res.status(500).json({ error: "Failed to open app" });
    }
    res.json({ message: `${appName} opened successfully` });
  });
});

app.listen(5000, () => {
  console.log("✅ Backend running on port 5000");
});
