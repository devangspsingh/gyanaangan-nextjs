'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyStudentProfile } from '@/services/apiService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import StudentProfileForm from './StudentProfileForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ProfileCompleteAlert() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [profileIncomplete, setProfileIncomplete] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            if (!authLoading && isAuthenticated) {
                try {
                    const response = await getMyStudentProfile();
                    if (!response.error && response.data) {
                        // Check if profile is incomplete
                        setProfileIncomplete(!response.data.is_profile_complete);
                    } else {
                        // No profile exists, so it's incomplete
                        setProfileIncomplete(true);
                    }
                } catch (error) {
                    console.error('Error checking profile:', error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading && !isAuthenticated) {
                setLoading(false);
            }
        };

        checkProfile();
    }, [isAuthenticated, authLoading]);

    const handleDismiss = () => {
        setIsDismissed(true);
        // Store in sessionStorage so it doesn't show again during this session
        sessionStorage.setItem('profileAlertDismissed', 'true');
    };

    const handleProfileComplete = () => {
        setIsDialogOpen(false);
        setProfileIncomplete(false);
        setIsDismissed(true);
    };

    // Don't show if: loading, not authenticated, profile is complete, or dismissed
    if (loading || !isAuthenticated || !profileIncomplete || isDismissed) {
        return null;
    }

    // Check if dismissed in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('profileAlertDismissed') === 'true') {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-14 max-w-xl mx-auto md:bottom-0 left-0 right-0 z-50">
                <Alert className="bg-slate-900 border-0 border-t-2 rounded-t-2xl border-t-slate-600 max-w-4xl mx-auto">
                    {/* <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" /> */}
                    <div className="flex items-center justify-between gap-4">
                        <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-semibold">
                            Complete Your Academic Profile
                        </AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    size="sm"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                    Complete Now
                                </Button>
                                <Button
                                    onClick={handleDismiss}
                                    variant="ghost"
                                    size="sm"
                                    className="text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </AlertDescription>
                    </div>
                </Alert>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Complete Your Academic Profile</DialogTitle>
                        <DialogDescription>
                            Fill in your academic details to help us personalize your learning experience
                        </DialogDescription>
                    </DialogHeader>
                    <StudentProfileForm onComplete={handleProfileComplete} />
                </DialogContent>
            </Dialog>
        </>
    );
}
