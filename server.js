const express = require('express');
const app = express();
const settingsRoutes = require('./routes/settingsRoutes');

app.use(express.json());

// Routes Mount Karein
app.use('/api/settings', settingsRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});