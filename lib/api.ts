import axios from 'axios';

// Get the Payload API URL from environment variables
const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL;

if (!PAYLOAD_URL) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_API_URL is not set');
}

// Create an Axios instance pre-configured for your Payload API
export const api = axios.create({
    baseURL: PAYLOAD_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Custom function to fetch data from a Payload collection
 * @param path The collection path (e.g., 'products', 'orders')
 */
export const fetchCollection = async <T>(path: string): Promise<T[]> => {
    try {
        const response = await api.get(`/${path}`);
        // Payload wraps collection results in a 'docs' array
        return response.data.docs || [];
    } catch (error) {
        console.error(`Error fetching ${path}:`, error);
        return [];
    }
};

/**
 * Custom function to trigger a POST request to your custom AI endpoints
 * @param path The custom endpoint path (e.g., 'ai/products/tag-unreviewed')
 * @param data Optional payload for the request
 */
export const triggerAIAction = async <T = unknown>(path: string, data?: Record<string, unknown>): Promise<T> => {
    try {
        const response = await api.post(`/${path}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error triggering AI action at ${path}:`, error);
        throw error;
    }
};

/**
 * Fetch a single document by ID
 * @param collection The collection name
 * @param id The document ID
 */
export const fetchDocument = async <T>(collection: string, id: string): Promise<T | null> => {
    try {
        const response = await api.get(`/${collection}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${collection} with ID ${id}:`, error);
        return null;
    }
};

/**
 * Create a new document
 * @param collection The collection name
 * @param data The document data
 */
export const createDocument = async <T>(collection: string, data: Record<string, unknown>): Promise<T | null> => {
    try {
        const response = await api.post(`/${collection}`, data);
        return response.data.doc;
    } catch (error) {
        console.error(`Error creating ${collection}:`, error);
        throw error;
    }
};
