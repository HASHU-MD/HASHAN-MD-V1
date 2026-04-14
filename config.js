const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "rQRV2D7C#XiCDAPTJzJUXBePQ4_ZCFsyfMsZll0yOX18WE8fOgfc",
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/vbo0vq.png",
AUTO_REPLY: process.env.AUTO_REPLY || "true",
ALIVE_MSG: process.env.ALIVE_MSG || "HELLO IM HASHAN MD CREATED BY HASHAN <NOW ALIVE> ",
};
