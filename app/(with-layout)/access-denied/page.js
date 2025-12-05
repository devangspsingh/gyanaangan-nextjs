'use client';

import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="flex justify-center">
                    <ShieldAlert className="h-24 w-24 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
                <p className="text-muted-foreground">
                    Your access to this website has been restricted by the administrator.
                </p>
                <div className="pt-4">
                    <Button asChild variant="outline">
                        <Link href="mailto:support@gyanaangan.in">Contact Support</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
