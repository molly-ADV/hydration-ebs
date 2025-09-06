const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Twitch Extension credentials (yours)
const EXT_SECRET = "Mkoiea+Fr7vh/kBI002mwcbpcusWI/7kcAZpYoYwVRI="; 
const CLIENT_ID = "9j9r0cfg6ulhtc1rxvfytfkwdukzcn";     
const CHANNEL_ID = "592490906";                   

// Track clicks
let clicks = 0;

// Handle clicks from viewers
app.post('/click', (req, res) => {
  clicks++;
  console.log("Click received. Total:", clicks);
  broadcastToChannel(clicks);
  res.send({ success: true, clicks });
});

// Broadcast update to Twitch PubSub
function broadcastToChannel(clicks) {
  const payload = {
    type: "click_update",
    clicks
  };

  const token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + 60, // expires in 1 min
    channel_id: CHANNEL_ID,
    user_id: "system",
    role: "external"
  }, EXT_SECRET);

  axios.post(`https://api.twitch.tv/extensions/message/${CHANNEL_ID}`, 
payload, {
    headers: {
      "Client-ID": CLIENT_ID,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
  .then(() => console.log("Broadcast sent:", clicks))
  .catch(err => console.error("Broadcast error:", err.response?.data || 
err.message));
}

// Start the server
app.listen(8081, () => {
  console.log("Hydration EBS running on port 8081");
});

