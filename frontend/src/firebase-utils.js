// firebase-utils.js - Fixed Version
import { db, auth } from './firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/* ============================
   AUTH HELPERS
============================ */

/**
 * Get the current user safely (waits for auth state)
 */
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        if (!auth) return resolve(null);

        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe();
                resolve(user);
            },
            reject
        );
    });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
    const user = await getCurrentUser();
    return !!user;
};

/* ============================
   FIRESTORE HELPERS
============================ */

/**
 * Safely fetch documents from Firestore after auth
 */
export const fetchDocuments = async (collectionPath, queries = []) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            console.warn('User not authenticated. Fetch skipped.');
            return [];
        }

        let q = collection(db, collectionPath);

        if (queries.length > 0) {
            q = query(q, ...queries);
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error(`Error fetching documents from ${collectionPath}:`, error);
        throw error;
    }
};

/**
 * Add a document safely
 */
export const addDocument = async (collectionPath, data) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated. Cannot add document.');
        }

        const docRef = await addDoc(collection(db, collectionPath), {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { id: docRef.id, success: true };
    } catch (error) {
        console.error(`Error adding document to ${collectionPath}:`, error);
        throw error;
    }
};

/**
 * Update an existing document
 */
export const updateDocument = async (collectionPath, docId, data) => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const docRef = doc(db, collectionPath, docId);
        await updateDoc(docRef, { ...data, updatedAt: new Date() });
    } catch (error) {
        console.error(`Error updating document ${docId} in ${collectionPath}:`, error);
        throw error;
    }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionPath, docId) => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const docRef = doc(db, collectionPath, docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting document ${docId} in ${collectionPath}:`, error);
        throw error;
    }
};

/**
 * Generic Firebase operation wrapper
 */
export const firebaseOperation = async (operation, fallback = null) => {
    try {
        return await operation();
    } catch (error) {
        console.error('Firebase operation failed:', error);

        if (process.env.NODE_ENV === 'development' && fallback !== null) {
            console.warn('Returning fallback data');
            return fallback;
        }

        throw error;
    }
};
