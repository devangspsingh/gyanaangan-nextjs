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

    if (!visitorIdPromise) {
        visitorIdPromise = FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => result.visitorId)
            .catch(error => {
                console.error("Analytics: Failed to get visitor ID", error);
                return 'unknown-visitor-' + Date.now(); // Fallback
            });
    }
    return visitorIdPromise;
};

/**
 * Gathers detailed device/browser information.
 */
const getDeviceInfo = () => {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    // Simple client-side parsing (can be enhanced or rely on backend parsing of UA)
    if (ua.indexOf("Win") !== -1) os = "Windows";
    else if (ua.indexOf("Mac") !== -1) os = "MacOS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("like Mac") !== -1) os = "iOS";

    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    return {
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        parsed_os: os,
        parsed_browser: browser,
        device_memory: navigator.deviceMemory,
        hardware_concurrency: navigator.hardwareConcurrency,
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

        // Use fetch with keepalive and credentials
        await fetch(TRACKING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
