'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axiosInstance';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import IPDetailsDialog from '../IPDetailsDialog'; // Reusing the dialog from parent dir
import toast from 'react-hot-toast';

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tracking/dashboard/visitors/');
            setVisitors(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch visitors:", error);
            toast.error("Failed to load visitors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'visitor_id',
            header: 'Visitor ID',
            cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
        },
        {
            accessorKey: 'ip_address',
            header: 'IP Address',
        },
        {
            accessorKey: 'access_status',
            header: 'Status',
            cell: ({ getValue }) => {
                const status = getValue();
                if (status === 'block') return <span className="text-red-500 flex items-center gap-1"><ShieldAlert size={14} /> Blocked</span>;
                if (status === 'force_login') return <span className="text-yellow-500 flex items-center gap-1"><Shield size={14} /> Forced Login</span>;
                return <span className="text-green-500 flex items-center gap-1"><ShieldCheck size={14} /> Allowed</span>;
            }
        },
        {
            accessorKey: 'last_seen',
            header: 'Last Seen',
            cell: ({ getValue }) => {
                const val = getValue();
                return val ? formatDistanceToNow(new Date(val), { addSuffix: true }) : 'Never';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedVisitor(row.original)}>
                    Manage
                </Button>
            ),
        }
    ], []);

    const table = useReactTable({
        data: visitors,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Visitor Management</h1>
                <Button onClick={fetchVisitors} variant="outline">Refresh</Button>
            </div>

            <div className="bg-white/5 border rounded-lg p-4">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Search IDs or IPs..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm bg-background/50 border-white/10"
                    />
                </div>

                <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-black/20">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-gray-400">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-white/10 hover:bg-white/5"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-gray-500"
                                    >
                                        No visitors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {selectedVisitor && (
                <IPDetailsDialog
                    visitor={selectedVisitor} // Pass the full visitor object
                    open={!!selectedVisitor}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedVisitor(null);
                            fetchVisitors(); // Refresh on close to show updated status
                        }
                    }}
                />
            )}
        </div>
    );
}
