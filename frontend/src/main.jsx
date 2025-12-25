import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'

// Global Styles
import './styles/style.css'
import './styles/social.css'
import './styles/components.css'
import './styles/profile.css'
import './styles/chat.css'
import './styles/whatsapp.css'
import './styles/call.css'
import './styles/login.css'

// FontAwesome (You might want to install this via npm later, but for now CDN in index.html or import here if npm installed)
// For verify, we'll assume the index.html template has it or we can import if downloaded. 
// Actually, let's inject the CDN link in index.html of Vite or just trust legacy styles if they used @import.
// Better practice: Add CDN to Vite's index.html

import { SocketProvider } from './contexts/SocketContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <SocketProvider>
                <App />
            </SocketProvider>
        </AuthProvider>
    </React.StrictMode>,
)
