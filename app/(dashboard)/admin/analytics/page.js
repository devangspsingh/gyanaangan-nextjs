'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// import { api_client } from '@/lib/api_client';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Loader2, Users, Monitor, Globe, Smartphone, Activity, ChevronLeft, ChevronRight, Search, RefreshCw, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import IPDetailsDialog from './IPDetailsDialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '@/lib/axiosInstance';

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [activitySeries, setActivitySeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chart Filters
    const [chartFilters, setChartFilters] = useState({
        isActive: false,
        authenticated: false,
        path: ''
    });

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('minutes', '30');
            if (chartFilters.isActive) params.append('is_active', 'true');
            if (chartFilters.authenticated) params.append('authenticated', 'true');
            if (chartFilters.path) params.append('path', chartFilters.path);

            const [statsRes, seriesRes] = await Promise.all([
                api.get('/tracking/dashboard-stats/'),
                api.get(`/tracking/dashboard-activity-series/?${params.toString()}`)
            ]);
            setData(statsRes.data);
            setActivitySeries(seriesRes.data.map(item => ({
                ...item,
                time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError("Failed to load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    // Separate fetch for just chart update (faster, less disruptive)
    const refreshChart = async () => {
        try {
            const params = new URLSearchParams();
            params.append('minutes', '30');
            if (chartFilters.isActive) params.append('is_active', 'true');
            if (chartFilters.authenticated) params.append('authenticated', 'true');
            if (chartFilters.path) params.append('path', chartFilters.path);

            const seriesRes = await api.get(`/tracking/dashboard-activity-series/?${params.toString()}`);
            setActivitySeries(seriesRes.data.map(item => ({
                ...item,
                time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
            toast.success("Chart updated");
        } catch (err) {
            console.error("Failed to refresh chart:", err);
        }
    }

    useEffect(() => {
        fetchAnalytics();

        // Poll for live data every 30 seconds
        const interval = setInterval(() => {
            // We can just refresh chart to be lighter
            refreshChart();
        }, 30000);
        return () => clearInterval(interval);
    }, [chartFilters]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const { counts, charts } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <div className="space-x-2">
                    <Link href="/admin/analytics/visitors">
                        <Button variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Visitors
                        </Button>
                    </Link>
                    <Button onClick={fetchAnalytics}>Refresh</Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Visitors" value={counts.total_visitors} icon={Users} />
                <StatsCard title="Total Sessions" value={counts.total_sessions} icon={Globe} />
                <StatsCard title="Total Events" value={counts.total_events} icon={Activity} />
                <StatsCard title="Active Sessions" value={counts.active_sessions} icon={Monitor} description="Currently active" />
                <StatsCard title="Unique IPs" value={counts.unique_ips} icon={Monitor} description="Distinct IP addresses" />
                <StatsCard title="Unique Users" value={counts.unique_users} icon={Users} description="Authenticated users" />
            </div>

            {/* Live Activity Chart */}
            <Card className="col-span-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Live Activity (Last 30 Minutes)</CardTitle>
                    <Button variant="ghost" size="icon" onClick={refreshChart} title="Refresh Chart">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activitySeries}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Filters Control Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 border-t pt-4 items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="active-mode"
                                checked={chartFilters.isActive}
                                onCheckedChange={(c) => setChartFilters(prev => ({ ...prev, isActive: c }))}
                            />
                            <Label htmlFor="active-mode" className="text-sm">Live Sessions Only</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="auth-mode"
                                checked={chartFilters.authenticated}
                                onCheckedChange={(c) => setChartFilters(prev => ({ ...prev, authenticated: c }))}
                            />
                            <Label htmlFor="auth-mode" className="text-sm">Logged In Only</Label>
                        </div>

                        <div className="flex-1 max-w-sm">
                            <input
                                placeholder="Filter by Page Path..."
                                value={chartFilters.path}
                                onChange={e => setChartFilters(prev => ({ ...prev, path: e.target.value }))}
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Breakdown Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BreakdownCard title="Top Operating Systems" data={charts.os} icon={Monitor} dataKey="os" />
                <BreakdownCard title="Top Browsers" data={charts.browser} icon={Globe} dataKey="browser" />
                <BreakdownCard title="Device Types" data={charts.device} icon={Smartphone} dataKey="device_type" />
            </div>

            {/* Recent Activity Table */}
            <h2 className="text-xl font-semibold tracking-tight pt-4">Activity Log</h2>
            <RecentActivityTable />
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

function RecentActivityTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);

    // Pagination & Filters State
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('');
    const [userStatus, setUserStatus] = useState('');
    const [visitorId, setVisitorId] = useState('');

    // IP Dialog State
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // DRF is 1-indexed for page, Tanstack is 0-indexed
            params.append('page', (pagination.pageIndex + 1).toString());
            params.append('page_size', pagination.pageSize.toString());

            if (search) params.append('search', search);
            if (eventType && eventType !== 'all') params.append('event_type', eventType);

            // Handle User Status Filter
            if (userStatus === 'authenticated') {
                params.append('session__user__isnull', 'false');
            } else if (userStatus === 'anonymous') {
                params.append('session__user__isnull', 'true');
            }

            if (visitorId) params.append('session__visitor__visitor_id', visitorId);

            const response = await api.get(`/tracking/dashboard/events/?${params.toString()}`);
            setData(response.data.results);
            setRowCount(response.data.count); // Total count for pagination
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchEvents();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagination.pageIndex, pagination.pageSize, search, eventType, userStatus, visitorId]);

    const columns = useMemo(() => [
        {
            accessorKey: 'event_type',
            header: 'Type',
            cell: info => <span className="font-medium capitalize">{info.getValue()}</span>
        },
        {
            accessorKey: 'session.user_email',
            header: 'User',
            cell: info => info.getValue() || <span className="text-muted-foreground italic">Anonymous</span>
        },
        {
            accessorFn: row => row.target_resource || row.url,
            header: 'URL / Resource',
            cell: info => (
                <div className="truncate max-w-[300px]" title={info.getValue()}>
                    {info.getValue()}
                </div>
            )
        },
        {
            accessorKey: 'session.visitor.ip_address',
            header: 'IP Address',
            cell: info => {
                const ip = info.getValue();
                return ip ? (
                    <button
                        className="text-blue-500 hover:underline hover:text-blue-700 transition-colors text-left"
                        onClick={() => setSelectedVisitor(info.row.original.session.visitor)}
                    >
                        {ip}
                    </button>
                ) : 'N/A';
            }
        },
        {
            accessorKey: 'timestamp',
            header: 'Time',
            cell: info => new Date(info.getValue()).toLocaleString()
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(rowCount / pagination.pageSize),
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-1 gap-2 w-full md:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search User, IP, URL..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPagination(old => ({ ...old, pageIndex: 0 })); }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-8"
                            />
                        </div>
                        <div className="relative w-[180px]">
                            <select
                                value={eventType}
                                onChange={e => { setEventType(e.target.value); setPagination(old => ({ ...old, pageIndex: 0 })); }}
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Events</option>
                                <option value="page_view">Page View</option>
                                <option value="click">Click</option>
                                <option value="download">Download</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                            </select>
                            <select
                                value={userStatus}
                                onChange={e => { setUserStatus(e.target.value); setPagination(old => ({ ...old, pageIndex: 0 })); }}
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Users</option>
                                <option value="authenticated">Authenticated</option>
                                <option value="anonymous">Anonymous</option>
                            </select>
                            <input
                                placeholder="Visitor ID..."
                                value={visitorId}
                                onChange={e => { setVisitorId(e.target.value); setPagination(old => ({ ...old, pageIndex: 0 })); }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-2"
                            />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total: <span className="font-medium text-foreground">{rowCount}</span> events
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border overflow-x-scroll">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                        No events found.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4 align-middle">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardContent>

            <IPDetailsDialog
                visitor={selectedVisitor}
                open={!!selectedVisitor}
                onOpenChange={(open) => !open && setSelectedVisitor(null)}
            />
        </Card>
    );
}
