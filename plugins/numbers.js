const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// 1. Number List eka (Meka JSON file ekaka save karagannath puluwan)
let monitoredNumbers = ["+94712345678", "+94771234567"]; 
let targetGroupId = "1234567890@g.us"; // Oyaage WhatsApp Group ID eka

/**
 * 2. WEBHOOK ENDPOINT
 * SMS Forwarder app eken data ewanne mekata.
 */
app.post('/sms-webhook', async (req, res) => {
    const { from, message, timestamp } = req.body;

    console.log(`SMS ekak awa: ${from}`);

    // Check karanawa number eka list eke thiyenawada kiyala
    if (monitoredNumbers.includes(from)) {
        const formattedMsg = `📥 *NEW OTP RECEIVED*\n\n` +
                             `📱 *From:* ${from}\n` +
                             `💬 *Message:* ${message}\n` +
                             `⏰ *Time:* ${new Date(timestamp).toLocaleString()}`;

        // Methana 'conn' kiyanne oyaage WhatsApp Connection object eka
        // await conn.sendMessage(targetGroupId, { text: formattedMsg });
        
        console.log("Group ekata forward kala!");
    }

    res.sendStatus(200);
});

/**
 * 3. COMMANDS (Bot logic eka athule danna)
 */
function handleCommands(msg, conn) {
    const text = msg.body;
    const args = text.split(" ");
    const command = args[0].toLowerCase();

    // Number ekak add karanna: .addotp +947xxxxxxxx
    if (command === ".addotp") {
        const newNumber = args[1];
        if (!newNumber) return conn.sendMessage(msg.chat, { text: "Number ekak danna!" });
        
        monitoredNumbers.push(newNumber);
        conn.sendMessage(msg.chat, { text: `✅ ${newNumber} monitoring list ekata damma.` });
    }

    // Number list eka balanna: .listotp
    if (command === ".listotp") {
        let list = "📋 *Active OTP Numbers:*\n\n";
        monitoredNumbers.forEach((n, i) => list += `${i+1}. ${n}\n`);
        conn.sendMessage(msg.chat, { text: list });
    }
}

// Server eka start kirima
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`OTP Webhook eka port ${PORT} eke duwanawa...`);
});
