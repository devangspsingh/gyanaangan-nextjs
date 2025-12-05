'use client';

import { useState, useEffect } from 'react';
import api_client from '@/lib/axiosInstance';
import { Loader2, Globe, Monitor, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function IPDetailsDialog({ visitor, open, onOpenChange }) {
    const [ipDetails, setIpDetails] = useState(null);
    const [visitorDetails, setVisitorDetails] = useState(null);
    const [loadingIp, setLoadingIp] = useState(false);
    const [loadingVisitor, setLoadingVisitor] = useState(false);
    const [error, setError] = useState(null);

    const ip = visitor?.ip_address;
    const visitorId = visitor?.visitor_id || visitor?.id; // Handle both id formats if mixed usage (but api usually returns visitor_id as UUID string in 'visitor_id' field, and 'id' as int PK)

    useEffect(() => {
        if (open && visitor) {
            setError(null);
            setIpDetails(null);
            setVisitorDetails(null);

            // 1. Fetch IP Geolocation
            if (ip) {
                setLoadingIp(true);
                fetch(`https://ipapi.co/${ip}/json/`)
                    .then(async res => {
                        if (!res.ok) throw new Error("Failed to fetch IP details");
                        return res.json();
                    })
                    .then(data => setIpDetails(data))
                    .catch(err => console.error("IP API Error", err))
                    .finally(() => setLoadingIp(false));
            }

            // 2. Fetch Latest Visitor Status from Backend
            // We use the UUID (visitor_id) if available, as that's what the lookup expects now
            const lookupId = visitor.visitor_id || visitor.id;

            if (lookupId) {
                setLoadingVisitor(true);
                api_client.get(`/tracking/dashboard/visitors/${lookupId}/`)
                    .then(res => setVisitorDetails(res.data))
                    .catch(err => console.error("Backend Visitor Error", err))
                    .finally(() => setLoadingVisitor(false));
            }
        }
    }, [open, visitor, ip]);

    const updateStatus = async (newStatus) => {
        const lookupId = visitor.visitor_id || visitor.id;
        if (!lookupId) return;
        try {
            await api_client.patch(`/tracking/dashboard/visitors/${lookupId}/`, {
                access_status: newStatus
            });
            setVisitorDetails(prev => ({ ...prev, access_status: newStatus }));
            toast.success(`Visitor status updated to: ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update visitor status");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Visitor Information</DialogTitle>
                    <DialogDescription>
                        Visitor ID: {visitor?.visitor_id} <br />
                        IP: {ip || 'Unknown'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* User Info Section */}
                    {visitorDetails?.last_user && (
                        <div className="p-4 rounded-md border bg-blue-50/50 dark:bg-blue-900/10 space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4" /> Associated User
                            </h4>
                            <div className="text-sm space-y-1">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Name:</span>
                                    <span className="col-span-2">{visitorDetails.last_user.name}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Email:</span>
                                    <span className="col-span-2">{visitorDetails.last_user.email}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Access Control Section */}
                    {visitorDetails && (
                        <div className="p-4 rounded-md border bg-muted/30 space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Monitor className="h-4 w-4" /> Access Control
                            </h4>
                            <div className="flex flex-col gap-2">
                                <div className="text-sm">
                                    Current Status: <span className="font-bold capitalize">{visitorDetails.access_status}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant={visitorDetails.access_status === 'allow' ? "secondary" : "outline"}
                                        onClick={() => updateStatus('allow')}
                                        disabled={visitorDetails.access_status === 'allow'}
                                    >
                                        Allow
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={visitorDetails.access_status === 'force_login' ? "secondary" : "outline"}
                                        className="border-orange-500/50 hover:bg-orange-500/10 text-orange-500"
                                        onClick={() => updateStatus('force_login')}
                                        disabled={visitorDetails.access_status === 'force_login'}
                                    >
                                        Force Login
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={visitorDetails.access_status === 'block' ? "destructive" : "outline"}
                                        className={visitorDetails.access_status !== 'block' ? "border-red-500/50 hover:bg-red-500/10 text-red-500" : ""}
                                        onClick={() => updateStatus('block')}
                                        disabled={visitorDetails.access_status === 'block'}
                                    >
                                        Block
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Geolocation Section */}
                    {loadingIp ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : ipDetails ? (
                        <div className="space-y-4 text-sm">
                            <h4 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                                <Globe className="h-4 w-4" /> Geolocation
                            </h4>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 border-b pb-2 border-dashed">
                                    <span className="font-medium">Location:</span>
                                    <span className="col-span-2">{ipDetails.city}, {ipDetails.region}, {ipDetails.country_name}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b pb-2 border-dashed">
                                    <span className="font-medium">ISP:</span>
                                    <span className="col-span-2">{ipDetails.org}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Timezone:</span>
                                    <span className="col-span-2">{ipDetails.timezone}</span>
                                </div>
                            </div>

                            {/* Google Maps Embed */}
                            <div className="rounded-md overflow-hidden border">
                                <iframe
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${ipDetails.latitude},${ipDetails.longitude}&z=13&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-sm p-2">IP Details unavailable.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
