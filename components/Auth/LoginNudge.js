'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import LoginDialog from './LoginDialog'; // Reusing the wrapper
import AnalyticsService from '@/services/analyticsService';
import api from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

export default function LoginNudge() {
    const { isAuthenticated, loading, login } = useAuth();
    const [open, setOpen] = useState(false);
    const [canClose, setCanClose] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        let timer = null;

        const runCheck = async () => {
            // 1. Wait for Auth Loading to complete
            // If loading is true, we simply do nothing. 
            // When loading becomes false, this effect will re-run (due to dependency).
            if (loading) return;

            // 2. If User is Authenticated, do nothing.
            if (isAuthenticated) return;

            // 3. Page Restriction check (dont show on blog)
            if (pathname.startsWith('/blog')) return;

            try {
                const visitorId = await AnalyticsService.getVisitorId();
                if (!isMounted) return; // Component unmounted or dependencies changed
                if (!visitorId) return;

                // Re-check auth state just in case it changed during await
                // Note: We can't access live 'isAuthenticated' here easily without refs, 
                // but 'isMounted' combined with dependency array handles most cases.
                // If isAuthenticated becomes true, the effect cleanly unmounts (isMounted=false).

                const response = await api.get(`/tracking/visitor-status/${visitorId}/`);
                if (!isMounted) return;

                const status = response.data.status;

                if (status === 'block') {
                    router.replace('/access-denied');
                    return;
                }

                if (status === 'force_login') {
                    setOpen(true);
                    setCanClose(false);
                    return;
                }

                // allow: check session to avoid spam
                if (sessionStorage.getItem('gyanaangan_nudge_shown')) return;

                timer = setTimeout(() => {
                    if (isMounted) {
                        setOpen(true);
                        setCanClose(true);
                        sessionStorage.setItem('gyanaangan_nudge_shown', 'true');
                    }
                }, 7000);

            } catch (error) {
                console.error('LoginNudge: Failed to check visitor status', error);
                if (!isMounted) return;

                // Fallback on error
                if (sessionStorage.getItem('gyanaangan_nudge_shown')) return;
                timer = setTimeout(() => {
                    if (isMounted) {
                        setOpen(true);
                        setCanClose(true);
                        sessionStorage.setItem('gyanaangan_nudge_shown', 'true');
                    }
                }, 7000);
            }
        };

        runCheck();

        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, [isAuthenticated, loading, pathname, router]);
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
                toast.error("Google login failed: No ID token received.");
                return;
            }

            const backendResponse = await api.post('/auth/google/', {
                id_token: idToken,
            });

            const { user, access, refresh } = backendResponse.data;
            login(user, access, refresh);
            toast.success('Welcome back!');
            setOpen(false);

            // No redirect needed, we are already on the page!
            // Just refresh data if needed (React Query or simple reload if critical)
            router.refresh();

        } catch (error) {
            console.error('Nudge Login failed:', error);
            const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen && !canClose) {
            return; // Block closing
        }
        setOpen(isOpen);
    };

    // If force_login, we want a more aggressive "Full Screen" look.
    // We already hid the close button via CSS in the wrapper div and hideCloseButton prop in LoginDialog (if supported).
    // The Dialog component renders centrally with a backdrop. That functions as a "modal".
    // "Full Screen" request might imply covering everything. The backdrop does that. 
    // The previous implementation using standard Dialog is likely sufficient if the close button is gone.

    return (
        <div className={!canClose ? "[&_button[aria-label=Close]]:hidden" : ""}>
            {/* CSS trick to hide Shadcn Close button if !canClose */}
            <LoginDialog
                isOpen={open}
                onOpenChange={handleOpenChange}
                title={canClose ? "Unlock Full Experience" : "Login Required"}
                description={canClose ? "Login to track your progress and save resources." : "You must be logged in to access this resources."}
                isPage={false}
            >
                <div className="flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.error('Google Login Failed');
                            toast.error('Google login failed.');
                        }}
                        theme="outline" // Matches the dark theme better or 'outline'
                        shape="rectangular"
                    // size="large"
                    // width="100%"
                    />
                </div>
                {/* "Maybe Later" button removed as per request. Close via 'X' or backdrop. */}
            </LoginDialog>
        </div>
    );
}
