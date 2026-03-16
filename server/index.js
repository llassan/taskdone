require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : '*';

const io = new Server(server, { cors: { origin: allowedOrigins } });
app.set('io', io);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TaskDone — We apply to jobs for you', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  socket.on('join-order', (id) => socket.join(`order-${id}`));
  socket.on('leave-order', (id) => socket.leave(`order-${id}`));
  socket.on('disconnect', () => {});
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html')));
}

connectDB().then(() => {
  server.listen(PORT, () => console.log(`TaskDone API running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('DB error:', err.message);
  server.listen(PORT, () => console.log(`TaskDone API running on http://localhost:${PORT} (no DB)`));
});
