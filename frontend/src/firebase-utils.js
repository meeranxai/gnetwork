// firebase-utils.js - Helper functions
import { db, auth } from './firebase';

/**
 * Safely fetch documents from Firestore
 */
export const fetchDocuments = async (collectionName, queries = []) => {
    try {
        if (!db) {
            throw new Error("Firestore not initialized");
        }
        
        const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        
        let q = collection(db, collectionName);
        
        // Apply queries if any
        if (queries.length > 0) {
            q = query(q, ...queries);
        }
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error(`Error fetching from ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Get current user safely
 */
export const getCurrentUser = () => {
    if (!auth) return null;
    return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getCurrentUser();
};

/**
 * Safely add a document
 */
export const addDocument = async (collectionName, data) => {
    try {
        if (!db) {
            throw new Error("Firestore not initialized");
        }
        
        const { collection, addDoc } = await import('firebase/firestore');
        
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error(`Error adding to ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Error handling wrapper for Firebase operations
 */
export const firebaseOperation = async (operation, fallback = null) => {
    try {
        return await operation();
    } catch (error) {
        console.error("Firebase operation failed:", error);
        
        // In development, return fallback
        if (process.env.NODE_ENV === 'development' && fallback !== null) {
            console.warn("Returning fallback data");
            return fallback;
        }
        
        throw error;
    }
};
