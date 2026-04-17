const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();

app.use(express.json());

// CONFIGURATION
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = "HASHU-MD";
const DB_REPO = "HASHAN-SESSION-DB1";
const SESSION_FILE = './session/creds.json';

// --- 1. SESSION SYNC FUNCTION ---
async function syncSession() {
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    
    const dbUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${DB_REPO}/main/creds.json`;
    try {
        const response = await axios.get(dbUrl, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        // වැදගත්: GitHub එකෙන් එන්නේ Object එකක් නම් එය stringify කර සේව් කරන්න
        fs.writeFileSync(SESSION_FILE, JSON.stringify(response.data, null, 2));
        console.log("✅ Session Synced from GitHub!");
        return true;
    } catch (e) {
        console.log("❌ No existing session found.");
        return false;
    }
}

// --- 2. START BOT FUNCTION ---
function startBot() {
    console.log("🚀 Starting HASHAN-MD-V1...");
    const child = spawn('node', ['main.js'], { // ඔබේ බොට්ගේ පටන් ගන්නා ෆයිල් එක main.js නම්
        stdio: 'inherit'
    });

    child.on('close', (code) => {
        console.log(`Bot process exited with code ${code}. Restarting...`);
        startBot();
    });
}

// --- 3. WEB API FOR AUTO DEPLOY ---
app.post('/deploy', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).send({ error: "No Session ID!" });

    try {
        const url = `https://api.github.com/repos/${GITHUB_USER}/${DB_REPO}/contents/creds.json`;
        let sha;
        try {
            const check = await axios.get(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            sha = check.data.sha;
        } catch (e) { sha = undefined; }

        // Session එක Upload කිරීම
        await axios.put(url, {
            message: "Deploy Session via Web",
            content: Buffer.from(sessionId).toString('base64'),
            sha: sha
        }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

        res.send({ success: true, message: "Deploying... Bot will start in 10 seconds." });
        
        // සෙමින් Restart කිරීම
        setTimeout(() => { process.exit(0); }, 5000); 

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// --- 4. SERVER RUN & AUTO SYNC ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Web Dashboard active on port ${PORT}`);
    const hasSession = await syncSession();
    if (hasSession) {
        startBot();
    } else {
        console.log("⚠️ Waiting for Session ID via Web Dashboard to start...");
    }
});
