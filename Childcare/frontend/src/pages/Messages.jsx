// File Path: src/pages/Messages.jsx
// Connected to real backend API + Socket.io for real-time messaging
// NO UI CHANGES — only data layer replaced (localStorage → backend API)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL  = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── API helpers ──────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const apiRequest = async (method, path, body = null) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const injectCSS = () => {
  if (document.getElementById('msg-styles')) return;
  const style = document.createElement('style');
  style.id = 'msg-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .mg-root {
      height: 100vh; display: flex; flex-direction: column;
      background: linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%);
      font-family: 'Quicksand', sans-serif;
      color: #1A237E; overflow: hidden;
    }
    .mg-topbar {
      height: 64px; flex-shrink: 0;
      background: linear-gradient(135deg, #1A237E 0%, #283593 100%);
      display: flex; align-items: center; padding: 0 24px; gap: 16px;
      z-index: 10;
      box-shadow: 0 4px 20px rgba(26,35,126,0.3);
    }
    .mg-back {
      padding: 8px 18px; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: white;
      font-family: 'Quicksand', sans-serif; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .mg-back:hover { background: rgba(255,255,255,0.2); }
    .mg-topbar-title {
      font-size: 1rem; font-weight: 700; color: white;
      display: flex; align-items: center; gap: 8px;
    }
    .mg-online-dot { width: 8px; height: 8px; border-radius: 50%; background: #4FC3F7; animation: mgPulse 2s infinite; }
    @keyframes mgPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
    .mg-topbar-sub { font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 500; }
    .mg-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .mg-role-badge { padding: 5px 12px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.5px; }
    .mg-layout { flex: 1; display: grid; grid-template-columns: 320px 1fr; overflow: hidden; max-width: 1400px; margin: 0 auto; width: 100%; }
    .mg-sidebar {
      background: white;
      border-right: 1px solid #E3F2FD;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 4px 0 20px rgba(0,0,0,0.05);
    }
    .mg-search-wrap {
      padding: 16px;
      border-bottom: 1px solid #F0F7FF;
      position: relative;
    }
    .mg-search-icon {
      position: absolute; left: 30px; top: 50%;
      transform: translateY(-50%);
      color: #90A4AE; font-size: 0.9rem;
      pointer-events: none; line-height: 1;
    }
    .mg-search {
      width: 100%; padding: 12px 16px 12px 40px;
      background: #F0F7FF;
      border: 2px solid #E3F2FD;
      border-radius: 14px; color: #1A237E;
      font-family: 'Quicksand', sans-serif; font-size: 0.9rem; font-weight: 600;
      outline: none; transition: all 0.2s;
    }
    .mg-search:focus { border-color: #7C3AED; background: white; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
    .mg-search::placeholder { color: #90A4AE; }
    .mg-conv-list { flex: 1; overflow-y: auto; }
    .mg-conv-list::-webkit-scrollbar { width: 4px; }
    .mg-conv-list::-webkit-scrollbar-track { background: transparent; }
    .mg-conv-list::-webkit-scrollbar-thumb { background: #E3F2FD; border-radius: 999px; }
    .mg-conv-group-label {
      padding: 14px 16px 8px;
      font-size: 0.7rem; font-weight: 700; color: #90A4AE;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .mg-conv-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; cursor: pointer;
      transition: all 0.15s; position: relative;
      border-left: 3px solid transparent;
    }
    .mg-conv-item:hover { background: rgba(124,58,237,0.05); }
    .mg-conv-item.active { background: rgba(124,58,237,0.1); border-left-color: #7C3AED; }
    .mg-conv-avatar {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0; position: relative;
    }
    .mg-conv-online {
      position: absolute; bottom: -2px; right: -2px;
      width: 11px; height: 11px; border-radius: 50%;
      background: #4FC3F7; border: 2px solid white;
    }
    .mg-conv-info { flex: 1; min-width: 0; }
    .mg-conv-name { font-size: 0.9rem; font-weight: 700; color: #1A237E; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mg-conv-preview { font-size: 0.78rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
    .mg-conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .mg-conv-time { font-size: 0.7rem; color: #90A4AE; font-weight: 500; }
    .mg-conv-badge {
      min-width: 20px; height: 20px; border-radius: 999px;
      background: #7C3AED; color: white;
      font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; padding: 0 6px;
    }
    .mg-chat { display: flex; flex-direction: column; background: white; overflow: hidden; }
    .mg-chat-header {
      padding: 16px 24px; background: white;
      border-bottom: 1px solid #E3F2FD;
      display: flex; align-items: center; gap: 14px; flex-shrink: 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .mg-chat-avatar {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; position: relative;
    }
    .mg-chat-name { font-size: 1rem; font-weight: 700; color: #1A237E; margin-bottom: 2px; }
    .mg-chat-status { font-size: 0.75rem; color: #4FC3F7; font-weight: 600; }
    .mg-chat-actions { margin-left: auto; display: flex; gap: 8px; }
    .mg-chat-action-btn {
      width: 38px; height: 38px; border-radius: 10px;
      border: 1px solid #E3F2FD;
      background: white; color: #90A4AE;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 1rem; transition: all 0.2s;
    }
    .mg-chat-action-btn:hover { background: #F0F7FF; color: #7C3AED; border-color: #7C3AED; }
    .mg-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; background: #F8FAFC; }
    .mg-messages::-webkit-scrollbar { width: 4px; }
    .mg-messages::-webkit-scrollbar-thumb { background: #E3F2FD; border-radius: 999px; }
    .mg-date-divider {
      text-align: center; margin: 16px 0 8px;
      font-size: 0.72rem; color: #90A4AE; font-weight: 600;
      position: relative;
    }
    .mg-date-divider::before, .mg-date-divider::after {
      content: ''; position: absolute; top: 50%; width: 30%; height: 1px;
      background: #E3F2FD;
    }
    .mg-date-divider::before { left: 0; }
    .mg-date-divider::after  { right: 0; }
    .mg-msg-row { display: flex; gap: 8px; margin-bottom: 4px; align-items: flex-end; }
    .mg-msg-row.mine { flex-direction: row-reverse; }
    .mg-msg-avatar {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0; margin-bottom: 4px;
    }
    .mg-bubble {
      max-width: 70%; padding: 12px 16px; border-radius: 18px;
      font-size: 0.9rem; line-height: 1.5; font-weight: 500;
      position: relative; word-break: break-word;
      animation: mgBubble 0.2s ease;
    }
    @keyframes mgBubble { from{opacity:0;transform:scale(0.95) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .mg-bubble.theirs { background: white; color: #1A237E; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .mg-bubble.mine   { background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(124,58,237,0.3); }
    .mg-bubble-time { font-size: 0.65rem; color: #90A4AE; font-weight: 500; margin-top: 4px; text-align: right; }
    .mg-bubble.theirs .mg-bubble-time { text-align: left; color: #90A4AE; }
    .mg-bubble-status { font-size: 0.65rem; }
    .mg-typing {
      display: flex; gap: 4px; padding: 12px 16px;
      background: white; border-radius: 18px; border-bottom-left-radius: 4px;
      width: fit-content; margin-bottom: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .mg-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #7C3AED; animation: mgTypeDot 1.2s infinite; }
    .mg-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .mg-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes mgTypeDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }
    .mg-input-area { padding: 16px 24px; background: white; border-top: 1px solid #E3F2FD; flex-shrink: 0; }
    .mg-input-row {
      display: flex; gap: 12px; align-items: flex-end;
      background: #F0F7FF;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 8px 8px 8px 16px; transition: border-color 0.2s;
    }
    .mg-input-row:focus-within { border-color: rgba(99,102,241,0.4); }
    .mg-textarea {
      flex: 1; background: transparent; border: none; outline: none;
      color: #1A237E; font-family: 'Quicksand', sans-serif;
      font-size: 0.9rem; font-weight: 500; resize: none;
      max-height: 120px; min-height: 24px; line-height: 1.5; padding: 4px 0;
    }
    .mg-textarea::placeholder { color: #90A4AE; }
    .mg-send-btn {
      width: 40px; height: 40px; border-radius: 12px; border: none;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s;
    }
    .mg-send-btn:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
    .mg-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .mg-input-hint { font-size: 0.68rem; color: #90A4AE; text-align: center; margin-top: 8px; }
    .mg-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); text-align: center; padding: 40px; }
    .mg-empty-icon  { font-size: 3.5rem; margin-bottom: 16px; opacity: 0.4; }
    .mg-empty-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: rgba(255,255,255,0.3); }
    .mg-empty-sub   { font-size: 0.82rem; color: rgba(255,255,255,0.15); }
    .mg-no-conv { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0F0F13; text-align: center; padding: 40px; }
    .mg-no-conv-icon  { font-size: 4rem; margin-bottom: 20px; opacity: 0.2; }
    .mg-no-conv-title { font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.25); margin-bottom: 8px; }
    .mg-no-conv-sub   { font-size: 0.85rem; color: rgba(255,255,255,0.12); }

    /* New Message Modal */
    .mg-new-msg-btn {
      display: flex; align-items: center; gap: 8px;
      margin: 12px 16px; padding: 10px 16px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border: none; border-radius: 12px;
      color: white; font-family: 'Manrope', sans-serif;
      font-size: 0.85rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .mg-new-msg-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
    .mg-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px); z-index: 100;
      display: flex; align-items: center; justify-content: center;
    }
    .mg-modal {
      background: #1A1A22; border-radius: 20px;
      width: 90%; max-width: 480px; max-height: 70vh;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: mgModalIn 0.3s ease;
    }
    @keyframes mgModalIn { from{opacity:0;transform:scale(0.95) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .mg-modal-header {
      padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .mg-modal-title { font-size: 1.1rem; font-weight: 700; color: white; }
    .mg-modal-close {
      width: 32px; height: 32px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1); background: transparent;
      color: rgba(255,255,255,0.5); cursor: pointer; display: flex;
      align-items: center; justify-content: center; font-size: 1rem;
      transition: all 0.2s;
    }
    .mg-modal-close:hover { background: rgba(255,255,255,0.1); color: white; }
    .mg-modal-search {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .mg-modal-search input {
      width: 100%; padding: 12px 16px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: white;
      font-family: 'Manrope', sans-serif; font-size: 0.9rem;
      outline: none; transition: all 0.2s;
    }
    .mg-modal-search input:focus { border-color: rgba(99,102,241,0.5); background: rgba(255,255,255,0.08); }
    .mg-modal-search input::placeholder { color: rgba(255,255,255,0.3); }
    .mg-modal-list { flex: 1; overflow-y: auto; padding: 8px; }
    .mg-modal-user {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 12px; cursor: pointer;
      transition: all 0.15s;
    }
    .mg-modal-user:hover { background: rgba(255,255,255,0.06); }
    .mg-modal-user-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }
    .mg-modal-user-info { flex: 1; }
    .mg-modal-user-name { font-size: 0.9rem; font-weight: 700; color: white; margin-bottom: 2px; }
    .mg-modal-user-role { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 500; }
    .mg-modal-empty { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.3); font-size: 0.85rem; }
    .mg-modal-loading { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.3); font-size: 0.85rem; }
    @media(max-width: 700px) {
      .mg-layout { grid-template-columns: 1fr; }
      .mg-sidebar { display: none; }
      .mg-sidebar.show { display: flex; position: fixed; inset: 56px 0 0 0; z-index: 50; }
    }
  `;
  document.head.appendChild(style);
};

// ── Helpers ──────────────────────────────────────────────────
const EMOJI_BY_ROLE  = { parent:'👨‍👩‍👧', caretaker:'👩‍🍼', admin:'🔐' };
const COLOR_BY_ROLE  = { parent:'#EFF6FF',  caretaker:'#F0FDF4',  admin:'#FFF8E1' };
const ROLE_COLORS    = { parent:'#3B82F6',  caretaker:'#059669',  admin:'#F59E0B' };
const ROLE_BG        = { parent:'rgba(59,130,246,0.15)', caretaker:'rgba(5,150,105,0.15)', admin:'rgba(245,158,11,0.15)' };

const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
const formatDate = (iso) => {
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
};

export default function Messages() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const role         = user?.role?.toLowerCase() || 'parent';
  const myId         = user?.id || '';

  const [conversations, setConversations] = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [search,        setSearch]        = useState('');
  const [typing,        setTyping]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [showNewMsg,    setShowNewMsg]    = useState(false);
  const [searchUsers,   setSearchUsers]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const bottomRef  = useRef(null);
  const textRef    = useRef(null);
  const socketRef  = useRef(null);

  // ── Setup Socket.io ──────────────────────────────────────
  useEffect(() => {
    injectCSS();

    const socket = io(BASE_URL, {
      auth: { token: getToken() },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    // Join personal room
    socket.on('connect', () => {
      socket.emit('join', myId);
    });

    // Real-time incoming message
    socket.on('new_message', (msg) => {
      // Normalize the incoming message
      const normalizedMsg = {
        ...msg,
        _id: msg._id?.toString() || msg._id,
        from: msg.from?._id?.toString() || msg.from?.toString() || msg.from,
        to: msg.to?._id?.toString() || msg.to?.toString() || msg.to,
      };
      // If the message is from the currently open conversation — append it
      setSelected(prev => {
        if (prev) {
          const msgFromId = normalizedMsg.from;
          const contactId = prev.contact._id?.toString() || prev.contact._id;
          if (msgFromId === contactId) {
            setMessages(m => [...m, normalizedMsg]);
          }
        }
        return prev;
      });
      // Refresh conversation list to update last message + unread count
      fetchConversations();
    });

    fetchConversations();

    return () => {
      socket.disconnect();
    };
  }, [myId]);

  // ── Scroll to bottom on new messages ────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Fetch conversations list ─────────────────────────────
  const fetchConversations = async () => {
    try {
      const res = await apiRequest('GET', '/messages/conversations');
      console.log('Conversations response:', res);
      // Ensure each conversation has proper contact data
      const convs = (res.conversations || []).map(c => ({
        ...c,
        contact: {
          _id: c.contact._id?.toString() || c.contact._id,
          name: c.contact.name || c.contact.fullName || 'Unknown User',
          email: c.contact.email || '',
          role: c.contact.role || 'user',
          avatar: c.contact.avatar || '',
        },
        lastMessage: c.lastMessage ? {
          ...c.lastMessage,
          _id: c.lastMessage._id?.toString() || c.lastMessage._id,
          from: c.lastMessage.from?._id?.toString() || c.lastMessage.from,
          to: c.lastMessage.to?._id?.toString() || c.lastMessage.to,
          text: c.lastMessage.text || '',
          createdAt: c.lastMessage.createdAt,
        } : null,
        unreadCount: c.unreadCount || 0,
      }));
      console.log('Processed conversations:', convs);
      setConversations(convs);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Search users to start new conversation ────────────────
  const handleSearchUsers = async () => {
    if (!searchUsers.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await apiRequest('GET', `/auth/users?search=${encodeURIComponent(searchUsers)}`);
      // Filter out current user and format results
      const users = (res.users || []).filter(u => (u._id?.toString() || u._id) !== myId).map(u => ({
        _id: u._id?.toString() || u._id,
        name: u.name || u.fullName || 'Unknown',
        email: u.email || '',
        role: u.role || 'user',
        avatar: u.avatar || '',
      }));
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchUsers.trim()) handleSearchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchUsers]);

  // ── Start new conversation ───────────────────────────────
  const startConversation = (user) => {
    const userId = user._id?.toString() || user._id;
    const newConv = {
      contact: {
        _id: userId,
        name: user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'user',
        avatar: user.avatar || '',
      },
      lastMessage: null,
      unreadCount: 0,
    };
    // Add to conversations list if not already there
    setConversations(prev => {
      const exists = prev.some(c => (c.contact._id?.toString() || c.contact._id) === userId);
      if (exists) return prev;
      return [newConv, ...prev];
    });
    setSelected(newConv);
    setMessages([]);
    setShowNewMsg(false);
    setSearchUsers('');
    setSearchResults([]);
    setTimeout(() => textRef.current?.focus(), 100);
  };

  // ── Select a conversation ────────────────────────────────
  const selectConv = async (conv) => {
    const contactId = conv.contact._id?.toString() || conv.contact._id;
    setSelected(conv);
    try {
      const res = await apiRequest('GET', `/messages/${contactId}`);
      // Normalize messages
      const msgs = (res.messages || []).map(m => ({
        ...m,
        _id: m._id?.toString() || m._id,
        from: m.from?._id?.toString() || m.from?.toString() || m.from,
        to: m.to?._id?.toString() || m.to?.toString() || m.to,
        text: m.text || '',
        createdAt: m.createdAt,
        read: m.read || false,
      }));
      setMessages(msgs);
      // Mark as read
      await apiRequest('PUT', `/messages/${contactId}/read`);
      // Update unread count in sidebar
      setConversations(prev =>
        prev.map(c =>
          (c.contact._id?.toString() || c.contact._id) === contactId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch {
      setMessages([]);
    }
    setTimeout(() => textRef.current?.focus(), 100);
  };

  // ── Send message ─────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selected) return;
    setInput('');

    const contactId = selected.contact._id?.toString() || selected.contact._id;
    console.log('Sending message to:', contactId, 'text:', text);

    try {
      const res = await apiRequest('POST', '/messages', {
        toUserId: contactId,
        text,
      });
      console.log('Message sent response:', res);
      // Normalize the new message
      const newMsg = {
        ...res.message,
        _id: res.message._id?.toString() || res.message._id,
        from: res.message.from?._id?.toString() || res.message.from,
        to: res.message.to?._id?.toString() || res.message.to,
      };
      setMessages(prev => [...prev, newMsg]);
      fetchConversations();
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Group messages by date ───────────────────────────────
  const grouped = messages.reduce((acc, msg) => {
    const d = formatDate(msg.createdAt);
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  const filteredConvs = conversations.filter(c =>
    (c.contact?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const tagStyle = {
    background: ROLE_BG[role],
    color: ROLE_COLORS[role],
    border: `1px solid ${ROLE_COLORS[role]}33`,
  };

  return (
    <div className="mg-root">

      {/* Top bar — UNCHANGED UI */}
      <div className="mg-topbar">
        <button className="mg-back" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <div className="mg-topbar-title">
            <div className="mg-online-dot" /> Messages
          </div>
          <div className="mg-topbar-sub">Trusted Care · {role.charAt(0).toUpperCase() + role.slice(1)}</div>
        </div>
        <div className="mg-topbar-right">
          <div className="mg-role-badge" style={tagStyle}>
            {role === 'parent' ? '👨‍👩‍👧' : role === 'caretaker' ? '👩‍🍼' : '🔐'} {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        </div>
      </div>

      {/* Layout — UNCHANGED UI */}
      <div className="mg-layout">

        {/* Sidebar */}
        <div className="mg-sidebar">
          <div className="mg-search-wrap">
            <span className="mg-search-icon">🔍</span>
            <input
              className="mg-search"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* New Message Button */}
          <button className="mg-new-msg-btn" onClick={() => setShowNewMsg(true)}>
            <span>✏️</span> New Message
          </button>

          <div className="mg-conv-list">
            <div className="mg-conv-group-label">
              Conversations ({filteredConvs.length})
            </div>

            {loading ? (
              <div style={{ padding:'24px 16px', color:'rgba(255,255,255,0.2)', fontSize:'0.82rem', textAlign:'center' }}>
                Loading...
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding:'24px 16px', color:'rgba(255,255,255,0.2)', fontSize:'0.82rem', textAlign:'center' }}>
                No conversations yet
              </div>
            ) : filteredConvs.map(conv => {
              const contact    = conv.contact;
              const contactRole = contact.role?.toLowerCase() || 'parent';
              const last       = conv.lastMessage;
              const unreadN    = conv.unreadCount || 0;
              const contactId = contact._id?.toString() || contact._id;
              const lastFromId = last?.from?._id?.toString() || last?.from?.toString() || last?.from;

              return (
                <div
                  key={contactId}
                  className={`mg-conv-item ${selected?.contact?._id?.toString() === contactId ? 'active' : ''}`}
                  onClick={() => selectConv(conv)}
                >
                  <div className="mg-conv-avatar" style={{ background: COLOR_BY_ROLE[contactRole] || '#F0F7FF' }}>
                    {EMOJI_BY_ROLE[contactRole] || '👤'}
                    <div className="mg-conv-online" />
                  </div>
                  <div className="mg-conv-info">
                    <div className="mg-conv-name">{contact.name || 'Unknown'}</div>
                    <div className="mg-conv-preview">
                      {last
                        ? (lastFromId === myId ? '✓ You: ' : '') + (last.text || '')
                        : 'Start a conversation'}
                    </div>
                  </div>
                  <div className="mg-conv-meta">
                    <div className="mg-conv-time">{last ? formatTime(last.createdAt) : ''}</div>
                    {unreadN > 0 && <div className="mg-conv-badge">{unreadN}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        {!selected ? (
          <div className="mg-no-conv">
            <div className="mg-no-conv-icon">💬</div>
            <div className="mg-no-conv-title">Select a conversation</div>
            <div className="mg-no-conv-sub">Choose a contact from the left to start messaging</div>
          </div>
        ) : (
          <div className="mg-chat">
            <div className="mg-chat-header">
              <div
                className="mg-chat-avatar"
                style={{ background: COLOR_BY_ROLE[selected.contact.role?.toLowerCase()] || '#F0F7FF' }}
              >
                {EMOJI_BY_ROLE[selected.contact.role?.toLowerCase()] || '👤'}
              </div>
              <div>
                <div className="mg-chat-name">{selected.contact.name}</div>
                <div className="mg-chat-status">🟢 Online · {selected.contact.role}</div>
              </div>
              <div className="mg-chat-actions">
                <button className="mg-chat-action-btn" title="Call" onClick={() => alert('📞 Voice call coming soon!')}>📞</button>
                <button className="mg-chat-action-btn" title="Info">ℹ️</button>
              </div>
            </div>

            <div className="mg-messages">
              {Object.keys(grouped).length === 0 ? (
                <div className="mg-empty">
                  <div className="mg-empty-icon">👋</div>
                  <div className="mg-empty-title">Say hello!</div>
                  <div className="mg-empty-sub">Start the conversation with {selected.contact.name}</div>
                </div>
              ) : (
                Object.entries(grouped).map(([date, msgs]) => (
                  <React.Fragment key={date}>
                    <div className="mg-date-divider">{date}</div>
                    {msgs.map(msg => {
                      const fromId = msg.from?._id?.toString() || msg.from?.toString() || msg.from;
                      const isMine = fromId === myId;
                      const contactRole = selected.contact.role?.toLowerCase();
                      return (
                        <div key={msg._id} className={`mg-msg-row ${isMine ? 'mine' : ''}`}>
                          {!isMine && (
                            <div
                              className="mg-msg-avatar"
                              style={{ background: COLOR_BY_ROLE[contactRole] || '#F0F7FF' }}
                            >
                              {EMOJI_BY_ROLE[contactRole] || '👤'}
                            </div>
                          )}
                          <div className={`mg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                            {msg.text}
                            <div className="mg-bubble-time">
                              {formatTime(msg.createdAt)}
                              {isMine && (
                                <span className="mg-bubble-status">
                                  {msg.read ? ' ✓✓' : ' ✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))
              )}

              {typing && (
                <div className="mg-msg-row">
                  <div
                    className="mg-msg-avatar"
                    style={{ background: COLOR_BY_ROLE[selected.contact.role?.toLowerCase()] || '#F0F7FF' }}
                  >
                    {EMOJI_BY_ROLE[selected.contact.role?.toLowerCase()] || '👤'}
                  </div>
                  <div className="mg-typing">
                    <div className="mg-typing-dot" />
                    <div className="mg-typing-dot" />
                    <div className="mg-typing-dot" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="mg-input-area">
              <div className="mg-input-row">
                <textarea
                  ref={textRef}
                  className="mg-textarea"
                  placeholder={`Message ${selected.contact.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="mg-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  title="Send"
                >➤</button>
              </div>
              <div className="mg-input-hint">Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMsg && (
        <div className="mg-modal-overlay" onClick={() => { setShowNewMsg(false); setSearchUsers(''); setSearchResults([]); }}>
          <div className="mg-modal" onClick={e => e.stopPropagation()}>
            <div className="mg-modal-header">
              <div className="mg-modal-title">💬 New Message</div>
              <button className="mg-modal-close" onClick={() => { setShowNewMsg(false); setSearchUsers(''); setSearchResults([]); }}>✕</button>
            </div>
            <div className="mg-modal-search">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchUsers}
                onChange={e => setSearchUsers(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mg-modal-list">
              {searchLoading ? (
                <div className="mg-modal-loading">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="mg-modal-empty">
                  {searchUsers.trim() 
                    ? 'No users found. Try a different search.' 
                    : 'Start typing to search for users'}
                </div>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className="mg-modal-user"
                    onClick={() => startConversation(user)}
                  >
                    <div 
                      className="mg-modal-user-avatar" 
                      style={{ background: COLOR_BY_ROLE[user.role?.toLowerCase()] || '#EFF6FF' }}
                    >
                      {EMOJI_BY_ROLE[user.role?.toLowerCase()] || '👤'}
                    </div>
                    <div className="mg-modal-user-info">
                      <div className="mg-modal-user-name">{user.name}</div>
                      <div className="mg-modal-user-role">
                        {user.role === 'admin' ? 'Admin' : user.role === 'caretaker' ? 'Caretaker' : 'Parent'} · {user.email}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}