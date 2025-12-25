import React, { useEffect, useState } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import { Outlet } from 'react-router-dom';
import { API_BASE_URL } from '../../api/config';

const Layout = () => {
    const [serverStatus, setServerStatus] = useState('checking');

    useEffect(() => {
        document.body.classList.add('social-app');

        // Check backend connection
        const checkConnection = async () => {
            try {
                // Try to hit a simple endpoint or root
                const res = await fetch(`${API_BASE_URL}/api/users/check-username/ping-test-123`);
                // Any response (even 404) means server is reachable. Network Error means 500/Offline.
                // Better: Just check if fetch throws.
                setServerStatus('online');
            } catch (err) {
                console.error("Backend Connection Failed:", err);
                setServerStatus('offline');
            }
        };

        checkConnection();

        return () => {
            document.body.classList.remove('social-app');
        };
    }, []);

    return (
        <React.Fragment>
            {serverStatus === 'offline' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'red', color: 'white', padding: '10px', textAlign: 'center', zIndex: 99999 }}>
                    ⚠️ Cannot connect to Backend. API URL: {API_BASE_URL || 'Not Set'}
                </div>
            )}
            <div className="app-layout">
                <LeftSidebar />

                {/* Main Content Area */}
                <Outlet />

                <RightSidebar />
            </div>

            {/* Mobile Nav */}
            <MobileNav />

            {/* Global Toast Container */}
            <div id="toast-container" className="toast-container"></div>
        </React.Fragment>
    );
};

export default Layout;
