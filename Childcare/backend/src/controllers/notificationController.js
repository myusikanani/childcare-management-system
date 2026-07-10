const Notification = require('../models/Notification');

// @desc  Get my notifications
// @route GET /api/notifications
const getNotifications = async(req, res) => {
    const { unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(500);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
};

// @desc  Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async(req, res) => {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
};

// @desc  Mark ALL notifications as read
// @route PUT /api/notifications/read-all
const markAllRead = async(req, res) => {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
};

// @desc  Delete a notification
// @route DELETE /api/notifications/:id
const deleteNotification = async(req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
};

module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification };