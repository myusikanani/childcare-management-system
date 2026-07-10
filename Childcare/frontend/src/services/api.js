// ─────────────────────────────────────────────────────────────
//  api.js  –  Every backend API call for the Childcare App
//  Base URL: http://localhost:5000/api
// ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Helper: get JWT token from localStorage ────────────────────
const getToken = () => localStorage.getItem('token');

// ── Helper: build headers ─────────────────────────────────────
const headers = (withAuth = true) => {
    const h = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
};

// ── Helper: build multipart headers (for file uploads) ────────
const multipartHeaders = () => {
    const h = {};
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

// ── Helper: generic fetch wrapper ────────────────────────────
const request = async(method, path, body = null, auth = true) => {
    const options = {
        method,
        headers: headers(auth),
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────
export const authAPI = {
    // Register - all roles use same endpoint with role in body
    register: (data) => request('POST', '/auth/register', data, false),

    // Login
    login: (data) => request('POST', '/auth/login', data, false),

    // Profile
    getMe: () => request('GET', '/auth/profile'),
    updateProfile: async(data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (key === 'skills' && Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'children' && Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        const token = getToken();
        const res = await fetch(`${BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: { Authorization: token ? `Bearer ${token}` : '' },
            body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to update profile');
        return result;
    },
    changePassword: (data) => request('PUT', '/auth/change-password', data),
    deleteUser: (userId) => request('DELETE', `/auth/user/${userId}`),
    verifyCaretaker: (caretakerId) => request('PUT', `/auth/caretaker/${caretakerId}/verify`),
    rejectCaretaker: (caretakerId) => request('PUT', `/auth/caretaker/${caretakerId}/reject`),
};

// ─────────────────────────────────────────────────────────────
//  USERS / CARETAKERS
// ─────────────────────────────────────────────────────────────
export const usersAPI = {
    // Public: get caretaker list (NannyList page)
    getCaretakers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/users/caretakers${query ? '?' + query : ''}`, null, false);
    },

    // Single caretaker profile + reviews
    getCaretakerById: (id) => request('GET', `/users/caretakers/${id}`, null, false),

    // Update availability (Caretaker only)
    updateAvailability: (availability) => request('PUT', '/users/availability', { availability }),

    // Admin routes
    getAllUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/users${query ? '?' + query : ''}`);
    },
    toggleUserActive: (id) => request('PUT', `/users/${id}/toggle-active`),
    getAdminStats: () => request('GET', '/users/admin/stats'),
};

// ─────────────────────────────────────────────────────────────
//  BOOKINGS
// ─────────────────────────────────────────────────────────────
export const bookingsAPI = {
    // Create booking (Parent)
    create: (data) => request('POST', '/bookings', data),

    // Get my bookings (role-aware on backend)
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/bookings${query ? '?' + query : ''}`);
    },

    // Single booking
    getById: (id) => request('GET', `/bookings/${id}`),

    // Status changes
    confirm: (id) => request('PUT', `/bookings/${id}/confirm`),
    cancel: (id, reason) => request('PUT', `/bookings/${id}/cancel`, { reason }),
    complete: (id) => request('PUT', `/bookings/${id}/complete`),

    // Review
    addReview: (id, rating, review) => request('POST', `/bookings/${id}/review`, { rating, review }),

    // Booked slots for a caretaker on a date
    getSlots: (caretakerId, date) =>
        request('GET', `/bookings/slots/${caretakerId}?date=${date}`),
};

// ─────────────────────────────────────────────────────────────
//  TRAINING
// ─────────────────────────────────────────────────────────────
export const trainingAPI = {
    getMyTraining: () => request('GET', '/training/me'),
    startModule: (moduleId) => request('PUT', '/training/start-module', { moduleId }),
    completeModule: (moduleId, score) => request('PUT', '/training/complete-module', { moduleId, score }),
    getAllTraining: () => request('GET', '/training/all'), // Admin
};

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
    getAll: (unreadOnly = false) => request('GET', `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
    markRead: (id) => request('PUT', `/notifications/${id}/read`),
    markAllRead: () => request('PUT', '/notifications/read-all'),
    delete: (id) => request('DELETE', `/notifications/${id}`),
};

// ─────────────────────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────────────────────
export const healthCheck = () => request('GET', '/health', null, false);

// ─────────────────────────────────────────────────────────────
//  MESSAGES 
// ─────────────────────────────────────────────────────────────
export const messagesAPI = {
    getConversations: () => request('GET', '/messages/conversations'),
    getMessages: (userId) => request('GET', `/messages/${userId}`),
    sendMessage: (toUserId, text) => request('POST', '/messages', { toUserId, text }),
    markRead: (userId) => request('PUT', `/messages/${userId}/read`),
    getUnreadCount: () => request('GET', '/messages/unread-count'),
};

// ─────────────────────────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────────────────────────
export const paymentsAPI = {
    getPaymentHistory: () => request('GET', '/payments/history'),
    createPaymentIntent: (data) => request('POST', '/payments/create-intent', data),
    confirmPayment: (data) => request('POST', '/payments/confirm', data),
    requestRefund: (data) => request('POST', '/payments/refund', data),
};

// ─────────────────────────────────────────────────────────────
//  PARENT LEARNING (Learning Hub)
// ─────────────────────────────────────────────────────────────
export const parentLearningAPI = {
    // Get all content (articles, activities, recipes, courses)
    getContent: () => request('GET', '/parent-learning/content', null, false),
    
    // Get user progress, achievements, stats
    getProgress: () => request('GET', '/parent-learning/progress'),
    
    // Mark article as read
    markArticleRead: (articleId) => request('POST', '/parent-learning/article-read', { articleId }),
    
    // Course enrollment and progress
    enrollInCourse: (courseId) => request('POST', '/parent-learning/enroll', { courseId }),
    completeLesson: (courseId, lessonIndex) => request('PUT', '/parent-learning/lesson-complete', { courseId, lessonIndex }),
    
    // Save/unsave activities and recipes
    toggleActivitySave: (activityId) => request('PUT', '/parent-learning/activity-save', { activityId }),
    toggleRecipeSave: (recipeId) => request('PUT', '/parent-learning/recipe-save', { recipeId }),
    
    // Article comments
    getComments: (articleId) => request('GET', `/parent-learning/article/${articleId}/comments`),
    addComment: (articleId, text) => request('POST', `/parent-learning/article/${articleId}/comment`, { text }),
    toggleCommentLike: (articleId, commentId) => request('PUT', `/parent-learning/comment/${commentId}/like`, { articleId, commentId }),
};

// ─────────────────────────────────────────────────────────────
//  CARETAKER TRAINING (Training Page)
// ─────────────────────────────────────────────────────────────
export const caretakerTrainingAPI = {
    // Get all modules
    getModules: () => request('GET', '/caretaker-training/modules', null, false),
    
    // Get user progress, achievements, stats
    getProgress: () => request('GET', '/caretaker-training/progress'),
    
    // Start a module
    startModule: (moduleId) => request('POST', '/caretaker-training/start-module', { moduleId }),
    
    // Complete a lesson
    completeLesson: (moduleId, lessonIndex) => request('PUT', '/caretaker-training/complete-lesson', { moduleId, lessonIndex }),
    
    // Submit quiz
    submitQuiz: (moduleId, answers) => request('POST', '/caretaker-training/submit-quiz', { moduleId, answers }),
    
    // Get certificate data
    getCertificate: () => request('GET', '/caretaker-training/certificate'),
};

// ─────────────────────────────────────────────────────────────
//  SETTINGS (Admin)
// ─────────────────────────────────────────────────────────────
export const settingsAPI = {
    getSettings: () => request('GET', '/settings'),
    updateSettings: (settings) => request('PUT', '/settings', settings),
    backupDatabase: () => request('GET', '/settings/backup'),
    clearCache: () => request('POST', '/settings/clear-cache'),
};

// ─────────────────────────────────────────────────────────────
//  2FA (Two-Factor Authentication)
// ─────────────────────────────────────────────────────────────
export const twoFAAPI = {
    getStatus: () => request('GET', '/2fa/status'),
    setup: () => request('POST', '/2fa/setup'),
    enable: (token) => request('POST', '/2fa/enable', { token }),
    disable: (token, password) => request('POST', '/2fa/disable', { token, password }),
    verify: (userId, token, backupCode) => request('POST', '/2fa/verify', { userId, token, backupCode }),
};

// ─────────────────────────────────────────────────────────────
//  CHILDREN (Now stored in MongoDB)
// ─────────────────────────────────────────────────────────────
export const childrenAPI = {
    getAll: () => request('GET', '/children'),
    add: (data) => request('POST', '/children', data),
    update: (childId, data) => request('PUT', `/children/${childId}`, data),
    delete: (childId) => request('DELETE', `/children/${childId}`),
    updatePhoto: async (childId, file) => {
        const formData = new FormData();
        formData.append('photo', file);
        const token = getToken();
        const res = await fetch(`${BASE_URL}/children/${childId}/photo`, {
            method: 'POST',
            headers: { Authorization: token ? `Bearer ${token}` : '' },
            body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to upload photo');
        return result;
    },
};

// ─────────────────────────────────────────────────────────────
//  PAYMENT METHODS (Now stored in MongoDB)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
//  ADMIN COURSE MANAGEMENT
// ─────────────────────────────────────────────────────────────
export const adminCourseAPI = {
    getCourses: () => request('GET', '/admin-courses'),
    getCourse: (id) => request('GET', `/admin-courses/${id}`),
    createCourse: (data) => request('POST', '/admin-courses', data),
    updateCourse: (id, data) => request('PUT', `/admin-courses/${id}`, data),
    deleteCourse: (id) => request('DELETE', `/admin-courses/${id}`),
    addLesson: (courseId, data) => request('POST', `/admin-courses/${courseId}/lessons`, data),
    updateLesson: (courseId, index, data) => request('PUT', `/admin-courses/${courseId}/lessons/${index}`, data),
    deleteLesson: (courseId, index) => request('DELETE', `/admin-courses/${courseId}/lessons/${index}`),
};

export const paymentMethodsAPI = {
    getAll: () => request('GET', '/payment-methods'),
    add: (data) => request('POST', '/payment-methods', data),
    update: (methodId, data) => request('PUT', `/payment-methods/${methodId}`, data),
    delete: (methodId) => request('DELETE', `/payment-methods/${methodId}`),
    setDefault: (methodId) => request('PUT', `/payment-methods/${methodId}/default`),
};