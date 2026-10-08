const mongoose = require('mongoose');
const dns = require('dns');

// Fallback to Google / Cloudflare DNS if local ISP/router fails SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not allowed
}

module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};