'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Video,
    Clock,
    ArrowUpRight,
    Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EventCard = ({
    event,
    showRegistrationStatus = false,
    registrationStatus = null,
    registrationNumber = null,
    // We don't need showViewDetails logic anymore as the whole card is the link
    actionButton = null,
    className
}) => {

    // Helper to split date for the visual badge
    const getDateParts = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { day: 'numeric' }),
            month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'REGISTERED': 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200',
            'CONFIRMED': 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200',
            'WAITLIST': 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200',
            'CANCELLED': 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200',
            'PENDING': 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200',
        };

        return (
            <Badge variant="outline" className={cn("backdrop-blur-md", styles[status] || styles['PENDING'])}>
                {status}
            </Badge>
        );
    };

    const dateParts = getDateParts(event.start_datetime);
    const CardWrapper = actionButton ? 'div' : Link;
    const wrapperProps = actionButton ? {} : { href: `/event/${event.slug}` };

    return (
        <CardWrapper {...wrapperProps} className={cn("block group h-full outline-none", className)}>
            <Card className="py-0 h-full flex flex-col overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">

                {/* Image Header Section */}
                <div className="relative h-52 w-full overflow-hidden bg-muted">
                    {/* Image Logic */}
                    {event.event_image ? (
                        <>
                            {/* Blurred Background */}
                            <div className="absolute inset-0">
                                <Image
                                    src={event.event_image}
                                    alt=""
                                    fill
                                    className="object-cover blur-xl opacity-50 scale-110"
                                />
                            </div>
                            {/* Main Image with Zoom Effect */}
                            <div className="relative h-full w-full rounded transition-transform duration-500 group-hover:scale-105">
                                <Image
                                    src={event.event_image}
                                    alt={event.title}
                                    fill
                                    className="p-2 rounded-lg object-contain drop-shadow-lg"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-gradient-to-br from-muted to-muted/50 text-muted-foreground/30">
                            <Ticket className="w-16 h-16 mb-2" />
                        </div>
                    )}

                    {/* Floating Date Badge (Modern Touch) */}
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-14 h-14 bg-background/95 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 text-center z-10">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">{dateParts.month}</span>
                        <span className="text-xl font-bold text-foreground leading-none mt-0.5">{dateParts.day}</span>
                    </div>

                    {/* Status Badge (Top Right) */}
                    {showRegistrationStatus && registrationStatus && (
                        <div className="absolute top-3 right-3 z-10">
                            {getStatusBadge(registrationStatus)}
                        </div>
                    )}

                    {/* Type Badge (Bottom Left of Image) */}
                    <div className="absolute bottom-3 left-3 z-10">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm hover:bg-background/90">
                            {event.event_type}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-5 pt-4 space-y-3">

                    {/* Title & Arrow */}
                    <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {event.title}
                        </h3>
                        {!actionButton && (
                            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        )}
                    </div>

                    {/* Meta Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/60 shrink-0" />
                            <span>{formatTime(event.start_datetime)} • {dateParts.full}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {event.is_online ? (
                                <Video className="w-4 h-4 text-primary/60 shrink-0" />
                            ) : (
                                <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                            )}
                            <span className="line-clamp-1">
                                {event.is_online ? 'Online Event' : event.venue_name}
                            </span>
                        </div>
                    </div>
                </CardContent>

                {/* Footer Section (Conditional) */}
                {(registrationNumber || actionButton) && (
                    <CardFooter className={cn(
                        "p-0 pt-0 border-t border-border/50",
                        registrationNumber ? "bg-muted/30" : ""
                    )}>
                        {actionButton ? (
                            <div className="p-4 w-full" onClick={(e) => e.stopPropagation()}>
                                {actionButton}
                            </div>
                        ) : (
                            registrationNumber && (
                                <div className="flex items-center justify-between w-full px-5 pb-3">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                                        <Ticket className="w-3 h-3" />
                                        Ticket ID
                                    </span>
                                    <code className="text-xs font-mono font-semibold bg-background px-2 py-1 rounded border">
                                        {registrationNumber}
                                    </code>
                                </div>
                            )
                        )}
                    </CardFooter>
                )}
            </Card>
        </CardWrapper>
    );
};

export default EventCard;