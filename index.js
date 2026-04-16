const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys')

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const fs = require('fs')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const util = require('util')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const prefix = '.'

// OTP Plugin eka import kireema
const { OtpPlugin, handleOtpCommands } = require('./plugins/otp_manager')

const ownerNumber = ['96876243710']

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
    const sessdata = config.SESSION_ID
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.download((err, data) => {
        if (err) throw err
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("Session downloaded ✅")
        })
    })
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json()); // Webhook ekata JSON support damma

//=============================================

async function connectToWA() {
    console.log("Connecting wa bot 🧬...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
    var { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        syncFullHistory: true,
        auth: state,
        version
    })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {
            console.log('😼 Installing... ')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed successful ✅')
            console.log('𝐇𝐀𝐒𝐇𝐀𝐍-𝐌𝐃 𝐖𝐀 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 😚🩵')

            // OTP Webhook eka start kireema
            try {
                OtpPlugin.startWebhook(conn);
                console.log('OTP Webhook Server started ✅');
            } catch (e) {
                console.log('Webhook error: ', e);
            }

            let up = `HASHAN MD Connected Successful ✅\n\nPREFIX: ${prefix}`;
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: `https://d.uguu.se/OBjsOZeT.jpg` }, caption: up })
        }
    })

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const from = mek.key.remoteJid
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const isOwner = ownerNumber.includes(senderNumber)
        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek })
        }

        // OTP Commands call kireema
        const msgData = { chat: from, body: body, reply: reply };
        await handleOtpCommands(conn, msgData);

        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })
                try {
                    cmd.function(conn, mek, m, { from, body, isCmd, command, args, q, isGroup, sender, senderNumber, isOwner, reply });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
    })
}

// Express server eka (Dashboard ekata)
app.get("/", (req, res) => {
    res.send("HASHAN-MD OTP Bot is running ✅");
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

setTimeout(() => {
    connectToWA()
}, 4000);
