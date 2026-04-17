const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const pino = require('pino');

const app = express();
app.use(cors()); // Browser එකෙන් එන Request වලට අවසර දීම (Fixes Connection Error)
app.use(express.json());

// CONFIGURATION (Railway Variables වලින් ලබාගනී)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = "HASHU-MD";
const DB_REPO = "HASHAN-SESSION-DB1";

app.post('/get-code', async (req, res) => {
    let num = req.body.number.replace(/[^0-9]/g, '');
    if (!num) return res.status(400).send({ error: "අංකය ඇතුළත් කරන්න!" });

    // සෑම අංකයකටම වෙනම ෆෝල්ඩරයක් සෑදීම
    const sessionDir = `./sessions/${num}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- Pairing Code එක ලබා ගැනීම ---
    if (!sock.authState.creds.registered) {
        try {
            await delay(3000);
            const code = await sock.requestPairingCode(num);
            if (!res.headersSent) {
                res.send({ code: code });
            }
        } catch (err) {
            console.error("Pairing Code Error:", err);
            if (!res.headersSent) {
                res.status(500).send({ error: "කේතය ලබා ගැනීමට නොහැකි විය." });
            }
        }
    }

    // --- Session එක Update වන විට GitHub වෙත Save කිරීම ---
    sock.ev.on("creds.update", async () => {
        await saveCreds();
        
        try {
            const credsPath = `${sessionDir}/creds.json`;
            if (fs.existsSync(credsPath)) {
                const credsData = fs.readFileSync(credsPath);
                const content = credsData.toString('base64');
                const githubUrl = `https://api.github.com/repos/${GITHUB_USER}/${DB_REPO}/contents/${num}_creds.json`;

                // පවතින ෆයිල් එකේ SHA එක පරීක්ෂාව
                let sha;
                try {
                    const check = await axios.get(githubUrl, {
                        headers: { Authorization: `token ${GITHUB_TOKEN}` }
                    });
                    sha = check.data.sha;
                } catch (e) { sha = undefined; }

                // GitHub වෙත Upload කිරීම
                await axios.put(githubUrl, {
                    message: `Auto-Save Session for ${num}`,
                    content: content,
                    sha: sha
                }, {
                    headers: { Authorization: `token ${GITHUB_TOKEN}` }
                });
                console.log(`✅ Session for ${num} saved to GitHub!`);
            }
        } catch (error) {
            console.error("GitHub Save Error:", error.message);
        }
    });

    // සම්බන්ධතාවය සාර්ථක වූ විට
    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log(`✅ ${num} Connected Successfully!`);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Bot Service Started on Port ${PORT}`);
});
