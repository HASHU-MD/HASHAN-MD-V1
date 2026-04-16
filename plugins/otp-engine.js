const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

// Data save karana file eka
const DATABASE_FILE = './otp_data.json';

// Initial Database Setup
if (!fs.existsSync(DATABASE_FILE)) {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify({ monitoredNumbers: [], targetJid: "" }));
}

const app = express();
app.use(bodyParser.json());

/**
 * OTP Plugin Core Logic
 */
const OtpPlugin = {
    // 1. Database eka load karanna
    getData: () => JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8')),

    // 2. Data save karanna
    saveData: (data) => fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2)),

    // 3. SMS Webhook Handling (Automation)
    startWebhook: (conn) => {
        app.post('/incoming-sms', async (req, res) => {
            const { from, message } = req.body; // SMS Forwarder app eken ena data
            const data = OtpPlugin.getData();

            // Number eka list eke thiyeddi pamanak forward karanna
            if (data.monitoredNumbers.includes(from) && data.targetJid) {
                const otpTemplate = `🔔 *OTP RECEIVED* 🔔\n\n📱 *Number:* ${from}\n💬 *Message:* ${message}\n⏰ *Received:* ${new Date().toLocaleString()}`;
                
                await conn.sendMessage(data.targetJid, { text: otpTemplate });
                console.log(`Forwarded OTP from ${from}`);
            }
            res.sendStatus(200);
        });

        app.listen(3000, () => console.log("OTP Webhook Active on Port 3000"));
    }
};

/**
 * Bot Commands Handler
 */
async function handleOtpCommands(conn, m) {
    const text = m.body || "";
    const args = text.split(" ");
    const command = args[0].toLowerCase();
    let data = OtpPlugin.getData();

    // Command: .addotp +947xxxxxxxx
    if (command === ".addotp") {
        const num = args[1];
        if (!num) return m.reply("Karuunakarala number ekak danna!");
        if (!data.monitoredNumbers.includes(num)) {
            data.monitoredNumbers.push(num);
            OtpPlugin.saveData(data);
            m.reply(`✅ ${num} Monitoring list ekata add kala.`);
        } else {
            m.reply("Me number eka danatath list eke thiyenawa.");
        }
    }

    // Command: .setgroup (Meka gahana group ekata OTP ewanawa)
    if (command === ".setgroup") {
        data.targetJid = m.chat;
        OtpPlugin.saveData(data);
        m.reply("✅ Me group eka OTP forward karana target eka widiyata set kala.");
    }

    // Command: .listotp
    if (command === ".listotp") {
        let msg = "📋 *OTP Monitored Numbers:*\n\n";
        data.monitoredNumbers.forEach((n, i) => msg += `${i + 1}. ${n}\n`);
        m.reply(msg);
    }
}

module.exports = { OtpPlugin, handleOtpCommands };
