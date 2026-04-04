const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

// GitHub RAW JSON URL with auto-reply mappings
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/TECH-HORIZON-SCHOOL-OFFICIAL/PROJECT_HORIZON/refs/heads/main/settings/autoreply.json';

/**
 * Auto-reply feature
 * Bot replies automatically if the incoming message matches a key in the JSON
 */
cmd({
  on: "body" // Trigger on every message
}, async (conn, mek, m, { body }) => {
  try {
    // Fetch auto-reply data from GitHub
    const res = await axios.get(GITHUB_RAW_URL);
    const autoReplyData = res.data;

    // Iterate through the keys in JSON
    for (const key in autoReplyData) {
      if (body.toLowerCase() === key.toLowerCase()) {
        // Check if AUTO_REPLY is enabled in config
        if (config.AUTO_REPLY === 'true') {
          await m.reply(autoReplyData[key]);
        }
        break; // Stop checking after the first match
      }
    }
  } catch (err) {
    console.error('Auto-reply fetch error:', err.message);
  }
});
