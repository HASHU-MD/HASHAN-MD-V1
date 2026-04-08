const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    react: "📝",
    alias: ["help", "commands"],
    desc: "Show all available commands with total count",
    category: "main",
    filename: __filename,
  },
  async (danuwa, m, msg, { from, reply }) => {
    const commandMap = {};
    let totalCommands = 0;

    // Group commands by category
    for (const command of commands) {
      if (command.dontAddCommandList) continue;

      totalCommands++;
      const category = (command.category || "MISC").toUpperCase();
      if (!commandMap[category]) commandMap[category] = [];

      const patterns = [command.pattern, ...(command.alias || [])]
        .filter(Boolean)
        .map(p => `.${p}`);

      commandMap[category].push(patterns.join(", "));
    }

    let menuText = `
𝐇𝐀𝐒𝐇𝐀𝐍-𝐌𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 𝐋𝐈𝐒𝐓 💫
Total Commands: *${totalCommands}*
`;

    for (const category of Object.keys(commandMap).sort()) {
      menuText += `\n┣━━ ⪼ *${category}*\n`;
      menuText += commandMap[category].map(cmd => `┃✨ ${cmd}`).join;
    }

    menuText += `╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await danuwa.sendMessage(from, { text: menuText }, { quoted: m });
  }
);
