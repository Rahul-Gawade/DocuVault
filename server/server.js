require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use(errorHandler);

connectDB()
  .then(() => app.listen(process.env.PORT, () => console.log('Server on ' + process.env.PORT)))
  .catch((err) => console.error('DB connection failed:', err.message));