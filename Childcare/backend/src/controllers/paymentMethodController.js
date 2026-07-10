const PaymentMethod = require('../models/PaymentMethod');

// Get all payment methods for user
exports.getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find({ user: req.user.id })
            .sort({ isDefault: -1, createdAt: -1 });
        
        res.json({ success: true, paymentMethods: methods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a payment method
exports.addPaymentMethod = async (req, res) => {
    try {
        const { brand, last4, expiry, isDefault } = req.body;
        
        if (!brand || !last4 || !expiry) {
            return res.status(400).json({ 
                success: false, 
                message: 'Brand, last 4 digits, and expiry are required' 
            });
        }
        
        // If this is set as default, unset other defaults
        if (isDefault) {
            await PaymentMethod.updateMany(
                { user: req.user.id },
                { isDefault: false }
            );
        }
        
        // Check if user has any cards, if not make this default
        const existingCount = await PaymentMethod.countDocuments({ user: req.user.id });
        
        const paymentMethod = new PaymentMethod({
            user: req.user.id,
            brand,
            last4,
            expiry,
            isDefault: isDefault || existingCount === 0
        });
        
        await paymentMethod.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Payment method added',
            paymentMethod
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const { brand, last4, expiry, isDefault } = req.body;
        
        const method = await PaymentMethod.findOne({ 
            _id: methodId, 
            user: req.user.id 
        });
        
        if (!method) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }
        
        if (brand) method.brand = brand;
        if (last4) method.last4 = last4;
        if (expiry) method.expiry = expiry;
        
        if (isDefault) {
            await PaymentMethod.updateMany(
                { user: req.user.id, _id: { $ne: methodId } },
                { isDefault: false }
            );
            method.isDefault = true;
        }
        
        await method.save();
        
        res.json({ success: true, message: 'Payment method updated', paymentMethod: method });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        
        const method = await PaymentMethod.findOneAndDelete({ 
            _id: methodId, 
            user: req.user.id 
        });
        
        if (!method) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }
        
        // If deleted method was default, make another one default
        if (method.isDefault) {
            const nextMethod = await PaymentMethod.findOne({ user: req.user.id });
            if (nextMethod) {
                nextMethod.isDefault = true;
                await nextMethod.save();
            }
        }
        
        res.json({ success: true, message: 'Payment method deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Set default payment method
exports.setDefault = async (req, res) => {
    try {
        const { methodId } = req.params;
        
        const method = await PaymentMethod.findOne({ 
            _id: methodId, 
            user: req.user.id 
        });
        
        if (!method) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }
        
        // Unset all defaults
        await PaymentMethod.updateMany(
            { user: req.user.id },
            { isDefault: false }
        );
        
        // Set this as default
        method.isDefault = true;
        await method.save();
        
        res.json({ success: true, message: 'Default payment method updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
