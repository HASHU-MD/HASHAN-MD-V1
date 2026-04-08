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
𝗛𝗔𝗦𝗛𝗔𝗡-𝗠𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗟𝗜𝗦𝗧 😚💗
Total Commands: *${totalCommands}*
`;

    for (const category of Object.keys(commandMap).sort()) {
      menuText += `\n┣━━ ⪼ *${category}*\n`;
      menuText += commandMap[category].map(cmd => `┃💗 ${cmd}`)("\n") + "\n";
    }

    menuText += `╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await danuwa.sendMessage(from, { text: menuText }, { quoted: m });
  }
);
