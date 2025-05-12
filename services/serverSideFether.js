const { cookies } = require("next/headers");

// Server-side focused fetcher
export const fetchFromServer = async (path, method = 'GET', body = null, accessToken = null, params = {}) => {
    const cookieStore = cookies(); // Get cookies in the Server Component context
    const accessTokenCookie = cookieStore.get('access_token'); // Get the cookie object
    const accessTokenReal = accessTokenCookie?.value; // Extract the value

    // fetchFromServer, when running on the Next.js server, should call the Django API directly.
    const actualBackendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const url = new URL(`${actualBackendBaseUrl}${path}`); // Construct direct URL to Django
    if (params && Object.keys(params).length > 0) {
        url.search = new URLSearchParams(params).toString();
    }

    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessTokenReal) {
        headers['Authorization'] = `Bearer ${accessTokenReal}`;
    }

    try {
        const response = await fetch(url.toString(), {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            cache: 'no-store',
            // credentials: 'include', // Not needed for server-to-server if using Authorization header.
            // This was for browser-to-Next.js server.
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText };
            }
            console.error(`Server API Error (${response.status}) for ${path}:`, errorData);
            return { data: errorData, error: true, fullResponse: response, status: response.status };
        }
        // Handle cases where response might be empty (e.g., 204 No Content)
        if (response.status === 204) {
            return { data: null, error: false, fullResponse: response, status: response.status };
        }
        const data = await response.json();
        return { data, error: false, fullResponse: response, status: response.status };
    } catch (error) {
        console.error(`Network error or failed server fetch for ${path}:`, error.message);
        return { data: null, error: true, message: error.message, fullResponse: null, status: 500 };
    }
};

