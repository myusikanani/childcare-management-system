import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const KNOWLEDGE_BASE = {
  platform: {
    keywords: ['book', 'booking', 'how to', 'sign up', 'register', 'login', 'account', 'profile', 'payment', 'cancel', 'refund', 'contact', 'support'],
    responses: [
      {
        q: 'how to book a caretaker',
        a: '📅 To book a caretaker:\n\n1️⃣ Go to "Find Caretaker" from the menu\n2️⃣ Browse available caretakers\n3️⃣ Click on a caretaker to view their profile\n4️⃣ Select date, time and hours\n5️⃣ Proceed to payment\n6️⃣ Confirm your booking!\n\nNeed help finding a caretaker? I can direct you there! 😊'
      },
      {
        q: 'how to create account',
        a: '👋 Creating an account is easy:\n\n1️⃣ Click "Sign Up" on the homepage\n2️⃣ Choose your role: Parent or Caretaker\n3️⃣ Fill in your details\n4️⃣ Verify your email\n5️⃣ Complete your profile\n\nFor Admin: Use secret code ADMIN2024 during signup.'
      },
      {
        q: 'payment',
        a: '💳 Payment Information:\n\n• We accept Credit/Debit Cards, UPI, Net Banking\n• Payments are processed securely\n• You pay after confirming booking details\n• Refunds processed within 5-7 business days\n• Platform fee: 10% of booking amount\n\nSafe and secure payments guaranteed! 🔒'
      },
      {
        q: 'cancel booking',
        a: '❌ To cancel a booking:\n\n1️⃣ Go to "My Bookings" in your dashboard\n2️⃣ Find the booking you want to cancel\n3️⃣ Click "Cancel" button\n4️⃣ Provide reason for cancellation\n5️⃣ Confirm cancellation\n\n⚠️ Note: Cancellations 24+ hours before get full refund. Later cancellations may have partial refund.'
      },
      {
        q: 'refund',
        a: '💰 Refund Policy:\n\n✅ Full refund: Cancel 24+ hours before booking\n⚠️ Partial refund: Cancel less than 24 hours before\n❌ No refund: After service has started\n\nRefunds are processed within 5-7 business days to original payment method.'
      },
      {
        q: 'contact support',
        a: '📞 Contact Us:\n\n• Email: support@trustedcare.com\n• Phone: +91 98765 43210\n• Available: Mon-Sat, 9 AM - 6 PM\n\nFor urgent matters, use the emergency contact in your profile. We\'re here to help! 💬'
      }
    ]
  },
  childcare: {
    keywords: ['child', 'baby', 'toddler', 'infant', 'feeding', 'sleep', 'food', 'eat', 'activity', 'play', 'safety', 'health', 'sick', 'fever'],
    responses: [
      {
        q: 'feeding',
        a: '🍼 Feeding Guide by Age:\n\n👶 0-6 Months:\n• Breast milk or formula only\n• No solid foods yet\n• Feed every 2-3 hours\n\n🧒 6-12 Months:\n• Introduce solid foods\n• Iron-rich foods important\n• 2-3 meals + milk feeds\n\n👧 1-3 Years:\n• 3 main meals + 2 snacks\n• Include all food groups\n• 500ml milk daily max\n\n⚠️ Always consult pediatrician for personalized advice.'
      },
      {
        q: 'sleep',
        a: '😴 Sleep Schedule by Age:\n\n👶 Newborn (0-3 months):\n• 14-17 hours per day\n• No set schedule yet\n\n🧒 4-11 Months:\n• 12-15 hours per day\n• 2-3 naps + night sleep\n\n👧 1-3 Years:\n• 11-14 hours per day\n• 1 afternoon nap\n• Consistent bedtime routine\n\n💡 Tips: Dark room, white noise, consistent routine!'
      },
      {
        q: 'activity',
        a: '🎨 Age-Appropriate Activities:\n\n👶 0-6 Months:\n• Tummy time\n• Reading board books\n• Mirror play\n• Soft toy interaction\n\n🧒 6-12 Months:\n• Stacking blocks\n• Peek-a-boo\n• Crawling games\n• Simple songs\n\n👧 1-3 Years:\n• Shape sorters\n• Drawing with crayons\n• Ball games\n• Pretend play\n\n🌟 Active play = Happy child! Move to Learning page for more ideas.'
      },
      {
        q: 'safety',
        a: '🛡️ Child Safety Tips:\n\n🏠 At Home:\n• Cover electrical outlets\n• Lock cabinets with chemicals\n• Safety gates on stairs\n• Soft corners on furniture\n\n🚶 Outside:\n• Hold hands near roads\n• ID bracelet for young kids\n• Sun protection\n• Bug repellent\n\n🚨 Emergency:\n• Save emergency contacts\n• Know nearest hospital\n• Keep first aid ready\n\nSafety first! 🛡️'
      },
      {
        q: 'sick',
        a: '🤒 When Your Child is Sick:\n\n🌡️ Fever:\n• Under 3 months: Call doctor immediately\n• 3+ months: Give fever medicine, monitor\n• 104°F+ (40°C): Emergency care\n\n🤢 Vomiting/Diarrhea:\n• Give oral rehydration solution\n• Small, frequent feeds\n• Watch for dehydration signs\n\n🚨 Seek Immediate Care If:\n• Difficulty breathing\n• Not responding\n• Seizures\n• Blue lips\n• Severe injury\n\n💊 Always consult a doctor! Save pediatrician number.'
      }
    ]
  },
  caretaker: {
    keywords: ['caretaker', 'nanny', 'babysitter', 'training', 'profile', 'rating', 'review', 'earn', 'payment schedule', 'availability'],
    responses: [
      {
        q: 'update profile',
        a: '👤 To Update Your Profile:\n\n1️⃣ Click your avatar/profile icon\n2️⃣ Select "Edit Profile"\n3️⃣ Update: Name, bio, experience, skills\n4️⃣ Add certifications\n5️⃣ Set your hourly rate\n6️⃣ Upload profile photo\n7️⃣ Save changes\n\n💡 Complete profiles get more bookings!'
      },
      {
        q: 'training',
        a: '📚 Training Modules:\n\n• Complete required training to get certified\n• Access via Dashboard > Training\n• Modules: Safety, First Aid, Child Development\n• Take quiz after each module\n• Score 80%+ to pass\n\n📈 Completed training = More trust = More bookings!'
      },
      {
        q: 'rating',
        a: '⭐ How Ratings Work:\n\n• Parents rate after service (1-5 stars)\n• Average of all ratings shown on profile\n• More 5-star reviews = Better visibility\n\n💡 Tips for 5 Stars:\n✅ Be on time\n✅ Communicate well\n✅ Take care of children warmly\n✅ Keep area clean\n✅ Report issues promptly\n\nGreat ratings = More bookings! 🌟'
      },
      {
        q: 'earn',
        a: '💰 How to Maximize Earnings:\n\n1️⃣ Complete your profile 100%\n2️⃣ Finish all training modules\n3️⃣ Get certified\n4️⃣ Build your rating (5 stars!)\n5️⃣ Set competitive rates\n6️⃣ Keep availability up\n7️⃣ Respond quickly to requests\n8️⃣ Build repeat customers\n\n💵 Earnings are transferred every Monday!'
      },
      {
        q: 'availability',
        a: '📅 Managing Availability:\n\n• Set your working hours in profile\n• Mark days as available/unavailable\n• Update in real-time\n• Accept bookings within your hours\n\n💡 Tip: Keep calendar updated to avoid conflicts. 24-hour minimum notice for bookings!'
      }
    ]
  },
  emergency: {
    keywords: ['emergency', 'urgent', 'help', 'police', 'ambulance', 'fire', 'accident', 'injury'],
    responses: [
      {
        q: 'emergency',
        a: '🚨 Emergency Contacts:\n\n🔥 Fire: 101\n🚓 Police: 100\n🏥 Ambulance: 102\n\n📞 Trusted Care Support:\n+91 98765 43210\n(Available 24/7 for urgent issues)\n\n🏥 Nearest Hospital:\nAdd your local hospital number in your profile emergency contacts.\n\n⚠️ For life-threatening emergencies, call official emergency numbers immediately!'
      }
    ]
  }
};

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Find Caretaker', path: '/nanny-search' },
  { icon: '📅', label: 'My Bookings', path: '/parent-dashboard' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '📚', label: 'Learning', path: '/learning' },
];

const INJECT_CSS = () => {
  if (document.getElementById('ai-chatbox-styles')) return;
  const style = document.createElement('style');
  style.id = 'ai-chatbox-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
    
    .acb-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #9333EA, #7C3AED);
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(147, 51, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      z-index: 9998;
      transition: all 0.3s ease;
    }
    
    .acb-launcher:hover {
      transform: scale(1.15);
      box-shadow: 0 12px 32px rgba(147, 51, 234, 0.5);
    }
    
    .acb-launcher.pulse-glow {
      animation: pulseGlow 2s ease-in-out infinite;
    }
    
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 8px 24px rgba(147, 51, 234, 0.4); }
      50% { box-shadow: 0 8px 40px rgba(147, 51, 234, 0.8), 0 0 60px rgba(147, 51, 234, 0.3); }
    }
    
    .acb-container {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      animation: acbSlideIn 0.3s ease;
    }
    
    @keyframes acbSlideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    @media (max-width: 480px) {
      .acb-container {
        width: calc(100vw - 32px);
        height: calc(100vh - 120px);
        right: 16px;
        bottom: 90px;
      }
    }
    
    .acb-header {
      background: linear-gradient(135deg, #9333EA, #7C3AED);
      padding: 20px;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .acb-avatar {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }
    
    .acb-header-text h3 {
      margin: 0;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
    }
    
    .acb-header-text p {
      margin: 2px 0 0;
      font-size: 0.78rem;
      opacity: 0.9;
    }
    
    .acb-online {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #4ADE80;
      border-radius: 50%;
      margin-right: 4px;
    }
    
    .acb-close {
      margin-left: auto;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .acb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #F8FAFF;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .acb-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.88rem;
      line-height: 1.5;
      white-space: pre-wrap;
      animation: acbFadeIn 0.3s ease;
    }
    
    @keyframes acbFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .acb-bot {
      background: white;
      color: #0F172A;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .acb-user {
      background: linear-gradient(135deg, #9333EA, #7C3AED);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .acb-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .acb-typing span {
      width: 8px;
      height: 8px;
      background: #94A3B8;
      border-radius: 50%;
      animation: acbBounce 1.4s infinite ease-in-out;
    }
    
    .acb-typing span:nth-child(1) { animation-delay: -0.32s; }
    .acb-typing span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes acbBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    .acb-quick {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #E2E8F0;
    }
    
    .acb-quick-btn {
      padding: 8px 14px;
      background: #F3E8FF;
      border: 1px solid #D8B4FE;
      border-radius: 999px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: #7C3AED;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    
    .acb-quick-btn:hover {
      background: #E9D5FF;
      transform: translateY(-1px);
    }
    
    .acb-input-area {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #E2E8F0;
      display: flex;
      gap: 8px;
    }
    
    .acb-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #E2E8F0;
      border-radius: 999px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .acb-input:focus {
      border-color: #9333EA;
    }
    
    .acb-send {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #9333EA, #7C3AED);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: transform 0.2s;
    }
    
    .acb-send:hover {
      transform: scale(1.05);
    }
    
    .acb-suggestions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
    
    .acb-suggestion {
      padding: 8px 12px;
      background: #F1F5F9;
      border: none;
      border-radius: 8px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.82rem;
      color: #475569;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s;
    }
    
    .acb-suggestion:hover {
      background: #E2E8F0;
      transform: translateX(4px);
    }
    .acb-suggestion {
      animation: suggestionSlide 0.3s ease forwards;
      opacity: 0;
    }
    .acb-suggestion:nth-child(1) { animation-delay: 0.1s; }
    .acb-suggestion:nth-child(2) { animation-delay: 0.2s; }
    .acb-suggestion:nth-child(3) { animation-delay: 0.3s; }
    .acb-suggestion:nth-child(4) { animation-delay: 0.4s; }
    .acb-suggestion:nth-child(5) { animation-delay: 0.5s; }
    
    @keyframes suggestionSlide {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
};

const findBestResponse = (query) => {
  const q = query.toLowerCase().trim();
  
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const item of data.responses) {
      if (q.includes(item.q.toLowerCase())) {
        return item.a;
      }
    }
  }
  
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const keyword of data.keywords) {
      if (q.includes(keyword)) {
        const relevant = data.responses.find(r => 
          r.q.toLowerCase().split(' ').some(word => q.includes(word))
        );
        if (relevant) return relevant.a;
        
        const defaultResp = data.responses[0];
        return `I found some ${category} information that might help:\n\n${defaultResp.a}`;
      }
    }
  }
  
  return `🤖 I'm here to help! Here are some things I can assist with:\n\n📋 **Platform Help**\n• How to book a caretaker\n• Account & payment questions\n• Cancel or modify bookings\n\n👶 **Childcare Advice**\n• Feeding by age\n• Sleep schedules\n• Activities & play\n• Safety tips\n\n💼 **For Caretakers**\n• Profile & training\n• Earnings & ratings\n\nType your question or click a quick action below! 😊`;
};

const SUGGESTIONS = [
  'How to book a caretaker?',
  'Feeding tips for toddlers',
  'Sleep schedule for babies',
  'How to cancel booking?',
  'Training for caretakers',
];

const CHATBOX_ICONS = [
  { id: 'robot', icon: '🤖', label: 'Robot' },
  { id: 'assistant', icon: '🧑‍💼', label: 'Assistant' },
  { id: 'helper', icon: '🙋', label: 'Helper' },
  { id: 'support', icon: '💁', label: 'Support' },
  { id: 'care', icon: '🤝', label: 'Care' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'heart', icon: '💗', label: 'Heart' },
  { id: 'star', icon: '⭐', label: 'Star' },
  { id: 'shield', icon: '🛡️', label: 'Shield' },
  { id: 'sparkle', icon: '✨', label: 'Sparkle' },
];

const AIChatbox = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('robot');
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Hello! I\'m your Trusted Care Assistant.\n\nI can help you with:\n• Booking a caretaker\n• Childcare advice\n• Platform questions\n• And more!\n\nWhat can I help you with?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentIcon = CHATBOX_ICONS.find(i => i.id === selectedIcon)?.icon || '🤖';

  useEffect(() => {
    INJECT_CSS();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text: text.trim() }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = findBestResponse(text);
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 800 + Math.random() * 400);
  };

  const handleQuickAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {isOpen && (
        <div className="acb-container">
          <div className="acb-header">
            <div className="acb-avatar">{currentIcon}</div>
            <div className="acb-header-text">
              <h3>Trusted Care Assistant</h3>
              <p><span className="acb-online" />Online • Ready to help</p>
            </div>
            <button className="acb-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="acb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`acb-message acb-${msg.type}`}>
                {msg.text}
                {msg.type === 'bot' && i === 0 && (
                  <div className="acb-suggestions">
                    {SUGGESTIONS.map((s, j) => (
                      <button key={j} className="acb-suggestion" onClick={() => handleSend(s)}>
                        💬 {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="acb-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="acb-quick">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} className="acb-quick-btn" onClick={() => handleQuickAction(action.path)}>
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          <div className="acb-input-area">
            <input
              type="text"
              className="acb-input"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="acb-send" onClick={() => handleSend()}>
              ➤
            </button>
          </div>
        </div>
      )}

      {showIconPicker && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '280px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '16px',
          zIndex: 10000,
          animation: 'acbSlideIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#1A237E', fontSize: '0.95rem' }}>🎨 Choose Icon</h4>
            <button 
              onClick={() => setShowIconPicker(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {CHATBOX_ICONS.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedIcon(item.id); setShowIconPicker(false); }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: selectedIcon === item.id ? '3px solid #9333EA' : '2px solid #E2E8F0',
                  background: selectedIcon === item.id ? '#F3E8FF' : 'white',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <button 
        className={`acb-launcher ${!isOpen ? 'pulse-glow' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        onContextMenu={(e) => { e.preventDefault(); setShowIconPicker(true); }}
        title="Right-click to change icon"
      >
        {isOpen ? '✕' : currentIcon}
      </button>
    </>
  );
};

export default AIChatbox;
