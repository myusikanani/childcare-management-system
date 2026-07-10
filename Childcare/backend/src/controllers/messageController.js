const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @desc  Get all conversations for logged-in user
//        Returns one entry per contact with latest message
// @route GET /api/messages/conversations
// ─────────────────────────────────────────────────────────────
const getConversations = async(req, res) => {
    const myId = req.user._id;

    // Get all messages where I am sender or receiver
    const messages = await Message.find({
            $or: [{ from: myId }, { to: myId }],
        })
        .sort({ createdAt: -1 })
        .populate('from', 'name email role avatar')
        .populate('to', 'name email role avatar');

    // Build conversation map — one entry per other person
    const convMap = {};
    messages.forEach(msg => {
        const other = msg.from._id.toString() === myId.toString() ? msg.to : msg.from;
        const otherId = other._id.toString();
        if (!convMap[otherId]) {
            convMap[otherId] = {
                contact: other,
                lastMessage: msg,
                unreadCount: 0,
            };
        }
        // Count unread messages TO me
        if (msg.to._id.toString() === myId.toString() && !msg.read) {
            convMap[otherId].unreadCount++;
        }
    });

    const conversations = Object.values(convMap);
    res.status(200).json({ success: true, conversations });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all messages between me and one other user
// @route GET /api/messages/:userId
// ─────────────────────────────────────────────────────────────
const getMessages = async(req, res) => {
    const myId = req.user._id;
    const otherId = req.params.userId;

    // Verify the other user exists
    const otherUser = await User.findById(otherId);
    if (!otherUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const messages = await Message.find({
            $or: [
                { from: myId, to: otherId },
                { from: otherId, to: myId },
            ],
        })
        .sort({ createdAt: 1 })
        .populate('from', 'name email role avatar')
        .populate('to', 'name email role avatar');

    // Mark all messages TO me as read
    await Message.updateMany({ from: otherId, to: myId, read: false }, { read: true, readAt: new Date() });

    res.status(200).json({ success: true, messages });
};

// ─────────────────────────────────────────────────────────────
// @desc  Send a message
// @route POST /api/messages
// ─────────────────────────────────────────────────────────────
const sendMessage = async(req, res) => {
    const { toUserId, text } = req.body;
    const myId = req.user._id;

    if (!toUserId || !text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'toUserId and text are required' });
    }

    if (toUserId === myId.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot send message to yourself' });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
        return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const message = await Message.create({
        from: myId,
        to: toUserId,
        fromEmail: req.user.email,
        toEmail: toUser.email,
        fromName: req.user.name,
        text: text.trim(),
    });

    // Populate for response
    await message.populate('from', 'name email role avatar');
    await message.populate('to', 'name email role avatar');

    // Create notification for the recipient
    await Notification.create({
        recipient: toUserId,
        type: 'message',
        title: 'New Message 💬',
        message: `${req.user.name} sent you a message: "${text.trim().substring(0, 50)}..."`,
        relatedId: message._id,
    });

    // Emit via Socket.io if available (real-time)
    if (req.app.get('io')) {
        req.app.get('io').to(toUserId.toString()).emit('new_message', message);
    }

    res.status(201).json({ success: true, message });
};

// ─────────────────────────────────────────────────────────────
// @desc  Mark messages from a user as read
// @route PUT /api/messages/:userId/read
// ─────────────────────────────────────────────────────────────
const markRead = async(req, res) => {
    const myId = req.user._id;
    const otherId = req.params.userId;

    await Message.updateMany({ from: otherId, to: myId, read: false }, { read: true, readAt: new Date() });

    res.status(200).json({ success: true, message: 'Messages marked as read' });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get unread message count
// @route GET /api/messages/unread-count
// ─────────────────────────────────────────────────────────────
const getUnreadCount = async(req, res) => {
    const count = await Message.countDocuments({
        to: req.user._id,
        read: false,
    });
    res.status(200).json({ success: true, count });
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markRead,
    getUnreadCount,
};