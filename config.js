const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ns5GxCbJ#P1WS4SUUVI0nDGEe8o3o751AM2w9isA7Ru3X1MBLPhY",
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/vbo0vq.png",
AUTO_REPLY: process.env.AUTO_REPLY || "true",
ALIVE_MSG: process.env.ALIVE_MSG || "HELLO IM HASHAN MD CREATED BY HASHAN <NOW ALIVE> ",
};
