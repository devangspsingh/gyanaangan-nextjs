'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react'; // UI Display
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
    CheckCircle2,
    Calendar,
    MapPin,
    Video,
    Clock,
    Download,
    Share2,
    AlertCircle,
    GraduationCap,
    ArrowLeft
} from 'lucide-react';
import eventService from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';

const AttendanceVerificationClient = ({ registrationId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [verification, setVerification] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVerification = async () => {
            setLoading(true);
            try {
                const response = await eventService.verifyAttendance(registrationId);
                if (response.error) {
                    setError(response.data?.error || 'Failed to verify attendance');
                } else {
                    setVerification(response.data);
                }
            } catch (error) {
                console.error('Error verifying attendance:', error);
                setError('An error occurred while verifying attendance');
            } finally {
                setLoading(false);
            }
        };
        if (registrationId) {
            fetchVerification();
        }
    }, [registrationId]);


    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Verified Attendance',
                    text: `Verified attendance at ${verification?.event_details?.title}`,
                    url: url,
                });
            } catch (error) {
                copyToClipboard(url);
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied!');
    };

    // --- PDF LOGIC (Fixed) ---
    const handleDownloadPDF = async () => {
        try {
            const verificationUrl = window.location.href;

            // Dynamic imports
            const { pdf } = await import('@react-pdf/renderer');
            const AttendanceCertificatePDF = (await import('./AttendanceCertificatePDF')).default;

            // Use 'qrcode' library for data generation
            const QRCode = await import('qrcode');
            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
                width: 200,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });

            const blob = await pdf(
                <AttendanceCertificatePDF
                    verification={verification}
                    qrCodeDataUrl={qrCodeDataUrl}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificate-${verification.registration_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Certificate downloaded!');
        } catch (error) {
            console.error('Error PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    // --- Formatters ---
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });


    // --- Loading State ---
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl flex gap-4">
                <Skeleton className="h-96 w-2/3 bg-slate-900 rounded-xl" />
                <Skeleton className="h-96 w-1/3 bg-slate-900 rounded-xl" />
            </div>
        </div>
    );

    // --- Error State ---
    if (error || !verification) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
            <Alert variant="destructive" className="max-w-md border-red-900 bg-red-950/30 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || "Certificate not found"}</AlertDescription>
            </Alert>
            <Button variant="link" className="text-slate-400 mt-4" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
        </div>
    );

    const verificationUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-purple-500/30">

            {/* Header
            <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
                <Link href="/">
                    <div className="relative h-10 w-40">
                        <Image
                            src="https://gyanaangan.in/images/logo%20white.png"
                            alt="GyanAangan"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>
                {user && (
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => router.back()}>
                        Close
                    </Button>
                )}
            </header> */}

            {/* Main Content - Centered Single Page Layout */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col md:flex-row">

                    {/* LEFT COLUMN: Event Visuals & Details */}
                    <div className="md:w-3/5 relative flex flex-col">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 z-0">
                            {verification.event_details.event_image && (
                                <Image
                                    src={verification.event_details.event_image}
                                    alt="Background"
                                    fill
                                    className="object-cover opacity-20 blur-xl"
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent" />
                        </div>

                        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                            {/* Organization Tag */}
                            <div className="flex items-center gap-3 mb-6">
                                {verification.event_details.organization_details.logo ? (
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 bg-white">
                                        <Image
                                            src={verification.event_details.organization_details.logo}
                                            alt="Org Logo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
                                        {verification.event_details.organization_details.name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Organized by</p>
                                    <p className="font-semibold text-white leading-tight">
                                        {verification.event_details.organization_details.name}
                                    </p>
                                </div>
                            </div>

                            {/* Event Title & Main Info */}
                            <div className="space-y-4">
                                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30">
                                    {verification.event_details.event_type}
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                    {verification.event_details.title}
                                </h1>

                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        <span>{formatDate(verification.event_details.start_datetime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <span>{formatTime(verification.event_details.start_datetime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        {verification.event_details.is_online ? (
                                            <Video className="w-4 h-4 text-purple-400" />
                                        ) : (
                                            <MapPin className="w-4 h-4 text-purple-400" />
                                        )}
                                        <span>{verification.event_details.is_online ? 'Online Event' : verification.event_details.venue_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Marked Present Time */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-xs text-slate-500 mb-1">Attendance Marked On</p>
                                <p className="text-sm font-mono text-slate-300">
                                    {formatDate(verification.marked_present_at)} • {formatTime(verification.marked_present_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Verification "Ticket" */}
                    <div className="md:w-2/5 bg-slate-950 border-l border-white/10 p-8 flex flex-col items-center text-center relative">
                        {/* Decorative Circles for Ticket Look */}
                        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-950 rounded-full transform -translate-y-1/2 md:block hidden border-r border-white/10" />

                        {/* Verified Status */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-pulse">
                                <CheckCircle2 className="w-4 h-4" />
                                Officially Verified
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 mb-3 shadow-xl">
                                {verification.user_details.profile_pic_url ? (
                                    <Image
                                        src={verification.user_details.profile_pic_url}
                                        alt="User"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-600">
                                            {verification.user_details.full_name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white">{verification.user_details.full_name}</h2>
                            {verification.user_details.student_profile?.college_name && (
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 justify-center text-center">
                                    <GraduationCap className="w-3 h-3" />
                                    {verification.user_details.student_profile.college_name}
                                </p>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
                            <QRCodeSVG
                                value={verificationUrl}
                                size={140}
                                level="H"
                                marginSize={0}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Scan to Verify</p>

                        {/* Action Buttons */}
                        <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                            <Button
                                variant="outline"
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                onClick={handleShare}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            {user && (
                                <Button
                                    className="w-full bg-white text-black hover:bg-slate-200"
                                    onClick={handleDownloadPDF}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            )}
                        </div>

                        <div className="mt-4 text-xs text-slate-600 font-mono">
                            ID: {verification.registration_number}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AttendanceVerificationClient;