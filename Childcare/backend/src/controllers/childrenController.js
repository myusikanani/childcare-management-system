const User = require('../models/User');

// Get all children for a user
exports.getChildren = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, children: user.children || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a child
exports.addChild = async (req, res) => {
    try {
        const { name, age, gender, allergies, notes } = req.body;
        
        if (!name || !age || !gender) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, age, and gender are required' 
            });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const newChild = {
            name,
            age,
            gender,
            allergies: allergies || 'None',
            notes: notes || '',
            photo: null,
            createdAt: new Date()
        };
        
        user.children.push(newChild);
        await user.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Child added successfully',
            child: user.children[user.children.length - 1]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a child
exports.updateChild = async (req, res) => {
    try {
        const { childId } = req.params;
        const { name, age, gender, allergies, notes } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const childIndex = user.children.findIndex(
            c => c._id.toString() === childId
        );
        
        if (childIndex === -1) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }
        
        // Update only provided fields
        if (name) user.children[childIndex].name = name;
        if (age) user.children[childIndex].age = age;
        if (gender) user.children[childIndex].gender = gender;
        if (allergies !== undefined) user.children[childIndex].allergies = allergies;
        if (notes !== undefined) user.children[childIndex].notes = notes;
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Child updated successfully',
            child: user.children[childIndex]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a child
exports.deleteChild = async (req, res) => {
    try {
        const { childId } = req.params;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const childIndex = user.children.findIndex(
            c => c._id.toString() === childId
        );
        
        if (childIndex === -1) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }
        
        user.children.splice(childIndex, 1);
        await user.save();
        
        res.json({ success: true, message: 'Child deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update child photo
exports.updateChildPhoto = async (req, res) => {
    try {
        const { childId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No photo uploaded' });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const childIndex = user.children.findIndex(
            c => c._id.toString() === childId
        );
        
        if (childIndex === -1) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }
        
        // Save photo path
        const photoUrl = `/uploads/children/${req.file.filename}`;
        user.children[childIndex].photo = photoUrl;
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Photo updated successfully',
            photo: photoUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
