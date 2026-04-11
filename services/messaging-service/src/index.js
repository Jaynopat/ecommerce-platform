const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');
const messageRoutes = require('./routes/message.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/messages', messageRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined room: ${orderId}`);
  });

  socket.on('send_message', async (data) => {
    const { orderId, senderId, senderRole, content } = data;
    try {
      const msg = await Message.create({ orderId, senderId, senderRole, content });
      io.to(orderId).emit('receive_message', msg);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (messaging-db)');
    server.listen(process.env.PORT, () => {
      console.log(`✅ Messaging Service running on port ${process.env.PORT}`);
    });
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });