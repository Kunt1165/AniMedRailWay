require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS (для Railway + frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/qr', require('./routes/qr'));

// Health check (Railway проверка)
app.get('/', (req, res) => {
  res.json({ status: 'PawCare API running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// IMPORTANT for Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PawCare API running on port ${PORT}`);
});