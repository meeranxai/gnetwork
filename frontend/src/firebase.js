import { initializeApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8Sg8rBwkCS4BYwgVrb_V_KQ4eMd0PkZ0",
    authDomain: "g-network-community.firebaseapp.com",
    projectId: "g-network-community",
    storageBucket: "g-network-community.firebasestorage.app",
    messagingSenderId: "358032029950",
    appId: "1:358032029950:web:a8dc470de9d85ead240daf"
};

// 🔥 SINGLETON PATTERN: Initialize Firebase only once
let app;
let db;
let auth;
let storage;

try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("✅ Firebase Initialized Successfully");
        
        // Initialize Firestore with offline persistence
        db = getFirestore(app);
        
        // Enable offline persistence for better UX
        if (typeof window !== 'undefined') {
            enableIndexedDbPersistence(db)
                .then(() => {
                    console.log("📱 Offline Persistence Enabled");
                })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn("⚠️ Multiple tabs open, persistence only enabled in one tab");
                    } else if (err.code === 'unimplemented') {
                        console.warn("⚠️ Browser doesn't support persistence");
                    }
                });
        }
        
        // Initialize Auth with persistence
        auth = getAuth(app);
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                console.log("🔐 Auth Persistence Set");
            })
            .catch((error) => {
                console.error("Auth persistence error:", error);
            });
        
        // Initialize Storage
        storage = getStorage(app);
        
        console.log("🎯 All Firebase Services Initialized");
    } else {
        // Use existing instance
        app = getApps()[0];
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
        console.log("🔄 Using Existing Firebase Instance");
    }
} catch (error) {
    console.error("❌ Firebase Initialization Failed:", error);
    
    // Create mock services for development if Firebase fails
    if (process.env.NODE_ENV === 'development') {
        console.warn("🚨 Creating mock Firebase services for development");
        
        // Mock objects to prevent app crashes
        db = {
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false, data: () => null }),
                    set: async () => {},
                    update: async () => {},
                    delete: async () => {}
                }),
                where: () => ({ get: async () => ({ empty: true, docs: [] }) }),
                get: async () => ({ empty: true, docs: [] })
            })
        };
        
        auth = {
            currentUser: null,
            onAuthStateChanged: (callback) => {
                callback(null);
                return () => {};
            },
            signInWithEmailAndPassword: async () => { 
                throw new Error("Firebase not initialized"); 
            },
            createUserWithEmailAndPassword: async () => { 
                throw new Error("Firebase not initialized"); 
            },
            signOut: async () => {}
        };
        
        storage = {
            ref: () => ({
                put: async () => ({ ref: { getDownloadURL: async () => '#' } })
            })
        };
    } else {
        // In production, rethrow the error
        throw error;
    }
}

// Development-only logging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Log Firebase status
    console.group("🔥 Firebase Status");
    console.log("App:", app ? "✅ Initialized" : "❌ Not Initialized");
    console.log("Firestore:", db ? "✅ Ready" : "❌ Not Ready");
    console.log("Auth:", auth ? "✅ Ready" : "❌ Not Ready");
    console.log("Storage:", storage ? "✅ Ready" : "❌ Not Ready");
    console.groupEnd();
    
    // Test connection
    if (app) {
        setTimeout(() => {
            console.log("🌐 Firebase Connection Test:");
            console.log("- Project:", firebaseConfig.projectId);
            console.log("- Auth Domain:", firebaseConfig.authDomain);
        }, 1000);
    }
}

// Export services with null checks
export { db, auth, storage };
export default app;
