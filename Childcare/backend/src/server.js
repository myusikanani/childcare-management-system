require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// ── Routes ─────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const parentLearningRoutes = require('./routes/parentLearningRoutes');
const caretakerTrainingRoutes = require('./routes/caretakerTrainingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const twoFARoutes = require('./routes/twoFARoutes');
const childrenRoutes = require('./routes/childrenRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const adminCourseRoutes = require('./routes/adminCourseRoutes');

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// ── Security Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ── Rate Limiting ──────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many requests, please try again later' },
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ── Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logger ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── Static Files ───────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Childcare API is running 🚀',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/parent-learning', parentLearningRoutes);
app.use('/api/caretaker-training', caretakerTrainingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/2fa', twoFARoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/admin-courses', adminCourseRoutes);

// ── 404 + Error Handlers ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        
        // Sync data after DB is connected
        const { initializeSettings } = require('./controllers/settingsController');
        const { updateModules } = require('./controllers/caretakerTrainingController');
        const { updateParentLearningData } = require('./controllers/parentLearningController');
        
        try {
            await initializeSettings();
            await updateModules();
            if (updateParentLearningData) await updateParentLearningData();
            console.log('✅ Settings and data initialized');
        } catch (syncError) {
            console.error('⚠️ Warning: Error syncing data (non-fatal):', syncError.message);
        }
        
        server.listen(PORT, () => {
            console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`📡 API:    http://localhost:${PORT}/api`);
            console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
            console.log(`🔌 Socket.io ready`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
