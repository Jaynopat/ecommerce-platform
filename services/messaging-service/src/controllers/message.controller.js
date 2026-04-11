const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const messages = await Message.find({ orderId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMessages };