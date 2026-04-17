const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require('express');
const app = express();
app.use(express.json());

// ඉතා වැදගත්: එක එක අංකයට වෙන වෙනම Auth සෑදීම
app.post('/get-code', async (req, res) => {
    let num = req.body.number.replace(/[^0-9]/g, '');
    if (!num) return res.status(400).send({ error: "අංකය ඇතුළත් කරන්න!" });

    // සෑම අංකයකටම වෙනම ෆෝල්ඩරයක් සෑදීම
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${num}`);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: require('pino')({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        try {
            await require('delay')(2000);
            const code = await sock.requestPairingCode(num);
            res.send({ code: code });
        } catch (err) {
            res.status(500).send({ error: "කේතය ලබා ගැනීමට නොහැකි විය." });
        }
    }

    sock.ev.on("creds.update", saveCreds);
    // මෙහිදී connection open වූ පසු Session එක GitHub එකට Save කරන logic එක දාන්න
});

app.listen(3000, () => console.log("Bot Service Started!"));
