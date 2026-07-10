require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB Connected');
};

const seedData = async() => {
    await connectDB();
    const db = mongoose.connection.db;

    // Check if data already exists
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
        console.log(`📊 Database has ${userCount} users. Skipping seed.`);
        mongoose.disconnect();
        return;
    }

    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ==================== ADMIN USERS ====================
    const adminUsers = [{
        name: 'Admin User',
        email: 'admin@trustedcare.com',
        password: hashedPassword,
        role: 'admin',
        avatar: null,
        phone: '+91 98765 43210',
        address: 'Mumbai, India',
        createdAt: new Date(),
        updatedAt: new Date()
    }];

    // ==================== PARENT USERS ====================
    const parentUsers = [{
            name: 'Priya Sharma',
            email: 'priya@example.com',
            password: hashedPassword,
            role: 'user',
            avatar: '👩',
            phone: '+91 98765 43211',
            address: 'Mumbai, Maharashtra',
            children: [
                { name: 'Arjun', age: 3, specialNeeds: false },
                { name: 'Ananya', age: 5, specialNeeds: false }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Rahul Verma',
            email: 'rahul@example.com',
            password: hashedPassword,
            role: 'user',
            avatar: '👨',
            phone: '+91 98765 43212',
            address: 'Delhi, NCR',
            children: [
                { name: 'Vivaan', age: 2, specialNeeds: false }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Sneha Patel',
            email: 'sneha@example.com',
            password: hashedPassword,
            role: 'user',
            avatar: '👩',
            phone: '+91 98765 43213',
            address: 'Ahmedabad, Gujarat',
            children: [
                { name: 'Myra', age: 4, specialNeeds: false },
                { name: 'Riya', age: 1, specialNeeds: false }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // ==================== CARETAKER USERS ====================
    const caretakerUsers = [{
            name: 'Meera Joshi',
            email: 'meera@caretaker.com',
            password: hashedPassword,
            role: 'caretaker',
            avatar: '👩‍🍼',
            phone: '+91 98765 43220',
            address: 'Mumbai, Maharashtra',
            bio: 'Certified childcare professional with 5+ years of experience. Specializing in infant care and early childhood development.',
            experience: 5,
            hourlyRate: 500,
            specializations: ['Infant Care', 'Early Childhood Education', 'First Aid Certified'],
            availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
            isVerified: true,
            isRejected: false,
            rating: 4.8,
            totalReviews: 45,
            totalBookings: 120,
            languages: ['English', 'Hindi', 'Marathi'],
            certifications: ['CPR Certified', 'First Aid', 'Child Development'],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Kavita Desai',
            email: 'kavita@caretaker.com',
            password: hashedPassword,
            role: 'caretaker',
            avatar: '👩‍🍼',
            phone: '+91 98765 43221',
            address: 'Pune, Maharashtra',
            bio: 'Passionate about child development and safety. Trained in Montessori methods and special needs care.',
            experience: 7,
            hourlyRate: 600,
            specializations: ['Montessori Training', 'Special Needs Care', 'Language Development'],
            availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false },
            isVerified: true,
            isRejected: false,
            rating: 4.9,
            totalReviews: 78,
            totalBookings: 200,
            languages: ['English', 'Hindi', 'Gujarati'],
            certifications: ['Montessori Certified', 'Special Needs Training', 'CPR Certified'],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Sunita Rao',
            email: 'sunita@caretaker.com',
            password: hashedPassword,
            role: 'caretaker',
            avatar: '👩‍🍼',
            phone: '+91 98765 43222',
            address: 'Bangalore, Karnataka',
            bio: 'Experienced nanny with background in early childhood education. Creating fun and educational environments for children.',
            experience: 4,
            hourlyRate: 450,
            specializations: ['Creative Learning', 'Art & Craft', 'Music & Movement'],
            availability: { monday: true, tuesday: true, wednesday: false, thursday: true, friday: true, saturday: false, sunday: false },
            isVerified: true,
            isRejected: false,
            rating: 4.7,
            totalReviews: 32,
            totalBookings: 85,
            languages: ['English', 'Hindi', 'Kannada'],
            certifications: ['Early Childhood Education', 'Art Therapy'],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Anjali Nair',
            email: 'anjali@caretaker.com',
            password: hashedPassword,
            role: 'caretaker',
            avatar: '👩‍🍼',
            phone: '+91 98765 43223',
            address: 'Chennai, Tamil Nadu',
            bio: 'Warm and nurturing caretaker with expertise in toddler care and behavioral development.',
            experience: 6,
            hourlyRate: 550,
            specializations: ['Toddler Care', 'Behavior Management', 'Nutrition & Meal Planning'],
            availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
            isVerified: true,
            isRejected: false,
            rating: 4.6,
            totalReviews: 56,
            totalBookings: 150,
            languages: ['English', 'Hindi', 'Tamil', 'Malayalam'],
            certifications: ['Nutrition Specialist', 'Behavioral Therapy', 'First Aid'],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Deepa Krishnan',
            email: 'deepa@caretaker.com',
            password: hashedPassword,
            role: 'caretaker',
            avatar: '👩‍🍼',
            phone: '+91 98765 43224',
            address: 'Hyderabad, Telangana',
            bio: 'Professional caretaker with nursing background. Expert in infant care and medical needs management.',
            experience: 8,
            hourlyRate: 700,
            specializations: ['Infant Care', 'Medical Needs', 'Postpartum Support'],
            availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false, sunday: false },
            isVerified: false,
            isRejected: false,
            rating: 0,
            totalReviews: 0,
            totalBookings: 0,
            languages: ['English', 'Hindi', 'Telugu'],
            certifications: ['Registered Nurse', 'Infant Care Specialist', 'CPR Certified'],
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // ==================== INSERT ALL DATA ====================
    await db.collection('users').insertMany([...adminUsers, ...parentUsers, ...caretakerUsers]);

    console.log('✅ Seed data inserted successfully!');
    console.log('📊 Statistics:');
    console.log(`   • ${adminUsers.length} Admin user(s)`);
    console.log(`   • ${parentUsers.length} Parent user(s)`);
    console.log(`   • ${caretakerUsers.length} Caretaker user(s)`);

    console.log('\n🔐 Login Credentials (all passwords: password123):');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   👤 Admin:      admin@trustedcare.com');
    console.log('   👨‍👩‍👧 Parents:   priya@example.com');
    console.log('               rahul@example.com');
    console.log('               sneha@example.com');
    console.log('   👩‍🍼 Caretakers: meera@caretaker.com');
    console.log('               kavita@caretaker.com');
    console.log('               sunita@caretaker.com');
    console.log('               anjali@caretaker.com');
    console.log('               deepa@caretaker.com');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    mongoose.disconnect();
};

seedData().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});