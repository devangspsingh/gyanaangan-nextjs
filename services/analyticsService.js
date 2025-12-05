import FingerprintJS from '@fingerprintjs/fingerprintjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Adjust as needed
const TRACKING_ENDPOINT = `${API_BASE_URL}/tracking/track/`;

// Singleton instance for the visitor ID
let visitorIdPromise = null;

/**
 * Initializes FingerprintJS and returns the visitor ID.
 * Caches the promise to avoid re-initializing.
 */
const getVisitorId = () => {
    if (typeof window === 'undefined') return Promise.resolve(null);

    // Helper to get/create a persistent random ID for this browser context (LocalStorage)
    // This ensures Incognito vs Normal tabs have different IDs (because LS is not shared)
    const getContextId = () => {
        let contextId = localStorage.getItem('analytics_context_id');
        if (!contextId) {
            contextId = crypto.randomUUID ? crypto.randomUUID() : 'ctx_' + Date.now() + '_' + Math.random();
            localStorage.setItem('analytics_context_id', contextId);
        }
        return contextId;
    };

    if (!visitorIdPromise) {
        visitorIdPromise = FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => {
                const fpId = result.visitorId;
                const ctxId = getContextId();
                // Composite ID: Fingerprint + Context
                return `${fpId}_${ctxId}`;
            })
            .catch(error => {
                console.error("Analytics: Failed to get visitor ID", error);
                const ctxId = getContextId();
                return 'unknown_' + ctxId; // Fallback
            });
    }
    return visitorIdPromise;
};

/**
 * Gathers detailed device/browser information.
 */
import { UAParser } from 'ua-parser-js';

/**
 * Gathers detailed device/browser information.
 */
const getDeviceInfo = () => {
    if (typeof window === 'undefined') return {};

    const parser = new UAParser();
    const result = parser.getResult();

    return {
        userAgent: navigator.userAgent,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Detailed parsed info from UAParser
        os_name: result.os.name,
        os_version: result.os.version,
        browser_name: result.browser.name,
        browser_version: result.browser.version,
        device_model: result.device.model,
        device_type: result.device.type, // mobile, tablet, smarttv, wearable, embedded
        device_vendor: result.device.vendor,
        cpu_architecture: result.cpu.architecture,
    };
};

/**
 * Base64 encodes a data object.
 */
const encodeData = (data) => {
    try {
        return btoa(JSON.stringify(data));
    } catch (e) {
        console.error("Analytics: Encoding failed", e);
        return "";
    }
};

/**
 * Sends a tracking event to the backend.
 * @param {string} eventType - The type of event (e.g., 'page_view', 'click', 'download')
 * @param {object} metadata - Custom data to send with the event
 * @param {string} targetResource - Optional target resource identifier
 */
export const trackEvent = async (eventType, metadata = {}, targetResource = '') => {
    if (typeof window === 'undefined') return;

    try {
        const visitorId = await getVisitorId();
        const deviceInfo = getDeviceInfo();

        // Encode the sensitive/detailed info as requested
        const encodedDeviceInfo = encodeData(deviceInfo);

        const payload = {
            visitor_id: visitorId,
            event_type: eventType,
            url: window.location.href,
            target_resource: targetResource,
            metadata: metadata,
            encoded_info: encodedDeviceInfo // Sending encoded info
        };

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
        };

        // Attempt to get the access token from localStorage (mimicking axiosInstance logic)
        try {
            const storedTokens = localStorage.getItem('tokens');
            if (storedTokens) {
                const { access } = JSON.parse(storedTokens);
                if (access) {
                    headers['Authorization'] = `Bearer ${access}`;
                }
            }
        } catch (e) {
            console.error("Analytics: Failed to get auth token", e);
        }

        // Use fetch with keepalive and credentials
        await fetch(TRACKING_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
            keepalive: true,
            credentials: 'include'
        });

    } catch (error) {
        console.error("Analytics: Failed to track event", error);
    }
};

/**
 * Helper specifically for page views
 */
export const trackPageView = (url) => {
    trackEvent('page_view', { path: url });
};

const AnalyticsService = {
    getVisitorId,
    trackEvent,
    trackPageView
};

export default AnalyticsService;
