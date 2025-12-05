'use client';

import { useEffect, useState } from 'react';
import api_client from '@/lib/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Monitor, Globe, Smartphone, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api_client.get('/tracking/dashboard-stats/');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const { counts, charts } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Visitors" value={counts.total_visitors} icon={Users} />
                <StatsCard title="Total Sessions" value={counts.total_sessions} icon={Globe} />
                <StatsCard title="Total Events" value={counts.total_events} icon={Activity} />
                <StatsCard title="Active Sessions" value={counts.active_sessions} icon={Monitor} description="Currently active" />
            </div>

            {/* Breakdown Charts (Tables for V1) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BreakdownCard title="Top Operating Systems" data={charts.os} icon={Monitor} dataKey="os" />
                <BreakdownCard title="Top Browsers" data={charts.browser} icon={Globe} dataKey="browser" />
                <BreakdownCard title="Device Types" data={charts.device} icon={Smartphone} dataKey="device_type" />
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, description }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}

function BreakdownCard({ title, data, icon: Icon, dataKey }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No data available</p>
                    ) : (
                        data.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span>{item[dataKey] || 'Unknown'}</span>
                                <span className="font-bold">{item.count}</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
