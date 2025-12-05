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
        // Only show on resource pages (and handle exclusions implicity or explicitly if needed)
        // User requested: "only on resource viewer page"
        // if (loading || !pathname.includes('/resources')) {
        //     return;
        // }

        if (isAuthenticated) return;

        let timer = null;

        const checkVisitorStatus = async () => {
            try {
                const visitorId = await AnalyticsService.getVisitorId();
                if (!visitorId) return;

                const response = await api.get(`/tracking/visitor-status/${visitorId}/`);
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

                // allow
                if (sessionStorage.getItem('gyanaangan_nudge_shown')) return;

                timer = setTimeout(() => {
                    setOpen(true);
                    setCanClose(true);
                    sessionStorage.setItem('gyanaangan_nudge_shown', 'true');
                }, 10000);
            } catch (error) {
                console.error('LoginNudge: Failed to check visitor status', error);

                if (sessionStorage.getItem('gyanaangan_nudge_shown')) return;

                timer = setTimeout(() => {
                    setOpen(true);
                    setCanClose(true);
                    sessionStorage.setItem('gyanaangan_nudge_shown', 'true');
                }, 10000);
            }
        };

        checkVisitorStatus();

        return () => {
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
