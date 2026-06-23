const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Serve all HTML/CSS/JS/images from the project root
app.use(express.static(__dirname, { extensions: ['html'], index: 'index.html' }));

app.use('/api/events',  require('./routes/events'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/tickets', require('./routes/tickets'));

// Fallback — serve index for any non-API path not matched above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  anavoroom  →  http://localhost:${PORT}\n`);
});
