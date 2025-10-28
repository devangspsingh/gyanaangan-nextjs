const { cookies } = require("next/headers");

// Server-side focused fetcher
export const fetchFromServer = async (path, method = 'GET', body = null, accessToken = null, params = {}) => {
    const cookieStore = await cookies(); // Get cookies in the Server Component context
    const accessTokenCookie = cookieStore.get('access_token'); // Get the cookie object
    const accessTokenReal = accessTokenCookie?.value; // Extract the value

    console.log('🔐 [ServerFetch] Path:', path);
    console.log('🔐 [ServerFetch] Has access_token cookie:', !!accessTokenReal);
    if (accessTokenReal) {
        console.log('🔐 [ServerFetch] Token preview:', accessTokenReal.substring(0, 20) + '...');
    }

    // fetchFromServer, when running on the Next.js server, should call the Django API directly.
    const actualBackendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const url = new URL(`${actualBackendBaseUrl}${path}`); // Construct direct URL to Django
    if (params && Object.keys(params).length > 0) {
        url.search = new URLSearchParams(params).toString();
    }

    console.log('🌐 [ServerFetch] Full URL:', url.toString());

    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessTokenReal) {
        headers['Authorization'] = `Bearer ${accessTokenReal}`;
    }

    console.log('📤 [ServerFetch] Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer [TOKEN]' : 'None' });

    try {
        const response = await fetch(url.toString(), {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            cache: 'no-store',
            credentials: 'include', // Not needed for server-to-server if using Authorization header.
            // This was for browser-to-Next.js server.
        });

        console.log('📥 [ServerFetch] Response status:', response.status, response.statusText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText };
            }
            console.error(`❌ [ServerFetch] Server API Error (${response.status}) for ${path}:`, errorData);
            return { data: errorData, error: true, fullResponse: response, status: response.status };
        }
        // Handle cases where response might be empty (e.g., 204 No Content)
        if (response.status === 204) {
            console.log('✅ [ServerFetch] 204 No Content response');
            return { data: null, error: false, fullResponse: response, status: response.status };
        }
        const data = await response.json();
        console.log('✅ [ServerFetch] Success! Data keys:', Object.keys(data));
        console.log('✅ [ServerFetch] Results count:', data.results?.length || 'N/A');
        if (data.results && data.results.length > 0) {
            console.log('✅ [ServerFetch] First item sample:', {
                id: data.results[0].id,
                name: data.results[0].name,
                is_saved: data.results[0].is_saved
            });
        }
        return { data, error: false, fullResponse: response, status: response.status };
    } catch (error) {
        console.error(`❌ [ServerFetch] Network error or failed server fetch for ${path}:`, error.message);
        return { data: null, error: true, message: error.message, fullResponse: null, status: 500 };
    }
};

