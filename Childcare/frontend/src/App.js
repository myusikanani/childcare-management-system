// File Path: src/App.js
// Fixed version - proper BrowserRouter and AuthProvider setup

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import AIChatbox from './components/AIChatbox';
import './styles/Animations.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <AIChatbox />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
