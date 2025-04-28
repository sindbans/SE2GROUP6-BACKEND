// server.js
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 HermesPass server running on https://beamish-baklava-7a2363.netlify.app/:${PORT}`);
});