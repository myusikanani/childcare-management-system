// MIGRATION SCRIPT - Run this ONCE to move localStorage data to MongoDB
// Instructions:
// 1. Start the backend server
// 2. Login as each user in the browser
// 3. Run this script in browser console (F12 → Console tab)
// 4. Or call the API endpoints manually

const API_BASE = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

// ─────────────────────────────────────────────
// MIGRATE CHILDREN
// ─────────────────────────────────────────────
async function migrateChildren() {
    const token = getToken();
    if (!token) {
        console.log('❌ Please login first');
        return;
    }

    const localChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
    
    if (localChildren.length === 0) {
        console.log('📭 No children in localStorage to migrate');
        return;
    }

    console.log(`🔄 Found ${localChildren.length} children in localStorage`);
    
    let migrated = 0;
    for (const child of localChildren) {
        try {
            // Check if already migrated (has _id from MongoDB)
            if (child._id || child.fromDB) {
                console.log(`⏭️  Skipping already migrated: ${child.childName}`);
                continue;
            }

            const res = await fetch(`${API_BASE}/children`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: child.childName,
                    age: child.age,
                    gender: child.gender,
                    allergies: child.allergies,
                    notes: child.notes
                })
            });
            
            const data = await res.json();
            if (data.success) {
                migrated++;
                console.log(`✅ Migrated: ${child.childName}`);
            }
        } catch (error) {
            console.log(`❌ Error migrating ${child.childName}:`, error);
        }
    }
    
    console.log(`🎉 Migration complete! ${migrated} children migrated to MongoDB`);
}

// ─────────────────────────────────────────────
// MIGRATE PAYMENT METHODS
// ─────────────────────────────────────────────
async function migratePaymentMethods() {
    const token = getToken();
    if (!token) {
        console.log('❌ Please login first');
        return;
    }

    const localCards = JSON.parse(localStorage.getItem('payment_cards') || '[]');
    
    if (localCards.length === 0) {
        console.log('📭 No payment methods in localStorage to migrate');
        return;
    }

    console.log(`🔄 Found ${localCards.length} payment methods in localStorage`);
    
    let migrated = 0;
    for (const card of localCards) {
        try {
            // Check if already migrated
            if (card.fromDB) {
                console.log(`⏭️  Skipping already migrated: ${card.brand} ending ${card.last4}`);
                continue;
            }

            const res = await fetch(`${API_BASE}/payment-methods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    brand: card.brand,
                    last4: card.last4,
                    expiry: card.expiry,
                    isDefault: card.isDefault
                })
            });
            
            const data = await res.json();
            if (data.success) {
                migrated++;
                console.log(`✅ Migrated: ${card.brand} ending ${card.last4}`);
            }
        } catch (error) {
            console.log(`❌ Error migrating card:`, error);
        }
    }
    
    console.log(`🎉 Migration complete! ${migrated} payment methods migrated to MongoDB`);
}

// ─────────────────────────────────────────────
// MIGRATE ALL DATA
// ─────────────────────────────────────────────
async function migrateAll() {
    console.log('🚀 Starting complete migration to MongoDB...');
    console.log('='.repeat(50));
    
    await migrateChildren();
    console.log('-'.repeat(50));
    await migratePaymentMethods();
    
    console.log('='.repeat(50));
    console.log('🎉 All migrations complete!');
    console.log('');
    console.log('Now clear localStorage? (Optional - keeps as backup)');
    console.log('Run: clearLocalStorage() to clear it');
}

// ─────────────────────────────────────────────
// CLEAR OLD DATA (Optional)
// ─────────────────────────────────────────────
function clearLocalStorage() {
    if (confirm('This will delete localStorage data. Are you sure?')) {
        localStorage.removeItem('childcare_children');
        localStorage.removeItem('payment_cards');
        console.log('🗑️ localStorage cleared');
        alert('Please refresh the page (F5)');
    }
}

// ─────────────────────────────────────────────
// RUN MIGRATION
// ─────────────────────────────────────────────
console.log('');
console.log('╔════════════════════════════════════════════════╗');
console.log('║   LOCAL STORAGE → MONGODB MIGRATION         ║');
console.log('╚════════════════════════════════════════════════╝');
console.log('');
console.log('Commands:');
console.log('  migrateChildren()     - Migrate children only');
console.log('  migratePaymentMethods() - Migrate payment methods only');
console.log('  migrateAll()           - Migrate everything');
console.log('  clearLocalStorage()    - Clear localStorage (after migration)');
console.log('');
console.log('⚠️  Make sure you are LOGGED IN before running!');
console.log('');

// Auto-run migration
migrateAll();
