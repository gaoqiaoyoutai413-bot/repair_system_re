'use client';

import { RepairCase } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useState, useTransition } from "react";
import { Search, Filter, Undo, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateCaseStatus } from "@/lib/actions";

export function HistoryClient({ cases }: { cases: RepairCase[] }) {
    const [query, setQuery] = useState(''); // Kept for backward compat or just rename to searchQuery
    // Actually let's align with DashboardClient
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [pendingId, setPendingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const filteredCases = cases.filter(c => {
        // 1. Keyword Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match = (
                (c.store_name || '').toLowerCase().includes(q) ||
                (c.client_name || '').toLowerCase().includes(q) ||
                (c.address || '').toLowerCase().includes(q) ||
                (c.assignee_name || '').toLowerCase().includes(q) ||
                (c.issue_description || '').toLowerCase().includes(q)
            );
            if (!match) return false;
        }

        // Use completed_at for history filtering if available, otherwise received_at
        // Actually Dashboard uses received_at. History should probably use received_at too for consistency?
        // Or completed_at? "History" usually implies when it was finished.
        // But the user said "past 3 months logs".
        // Let's use received_at to be consistent with Dashboard, or maybe checks both?
        // Most cases have received_at.
        const dateStr = c.completed_at || c.received_at;
        const caseDate = dateStr ? new Date(dateStr) : null;
        if (!caseDate) return false;

        // 2. Date Filter
        if (!startDate && !endDate && !searchQuery) {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            threeMonthsAgo.setHours(0, 0, 0, 0);
            return caseDate >= threeMonthsAgo;
        }

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (caseDate < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (caseDate > end) return false;
        }

        return true;
    });

    const handleRevert = async (caseId: string) => {
        if (!confirm('この案件をダッシュボード（未完了状態）に戻しますか？')) return;

        setPendingId(caseId);
        startTransition(async () => {
            await updateCaseStatus(caseId, '対応中');
            setPendingId(null);
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="grid gap-1.5">
                    <label htmlFor="historyStartDate" className="text-sm font-medium leading-none">開始日</label>
                    <input
                        id="historyStartDate"
                        name="historyStartDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-1.5">
                    <label htmlFor="historyEndDate" className="text-sm font-medium leading-none">終了日</label>
                    <input
                        id="historyEndDate"
                        name="historyEndDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-1.5 min-w-[200px]">
                    <label htmlFor="historySearchQuery" className="text-sm font-medium leading-none">キーワード検索</label>
                    <input
                        id="historySearchQuery"
                        name="historySearchQuery"
                        type="text"
                        placeholder="名前、店舗、担当者..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {(startDate || endDate || searchQuery) && (
                    <Button
                        variant="ghost"
                        onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}
                        className="mb-0.5"
                    >
                        クリア
                    </Button>
                )}
                <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="text-sm text-muted-foreground">
                        表示件数: {filteredCases.length} / {cases.length}
                    </div>
                    {(!startDate && !endDate && !searchQuery) && (
                        <div className="text-xs text-muted-foreground/70">
                            ※直近3ヶ月を表示中
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-4">店舗名</th>
                            <th className="p-4">完了日時</th>
                            <th className="p-4">店舗担当者</th>
                            <th className="p-4">担当者</th>
                            <th className="p-4">ステータス</th>
                            <th className="p-4">内容</th>
                            <th className="p-4">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                    該当する履歴はありません
                                </td>
                            </tr>
                        ) : (
                            filteredCases.map((c) => (
                                <tr key={c.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                                    <td className="p-4">{c.store_name || '-'}</td>
                                    <td className="p-4">{c.completed_at || c.received_at}</td>
                                    <td className="p-4 font-medium">{c.client_name}</td>
                                    <td className="p-4">{c.assignee_name || '-'}</td>
                                    <td className="p-4">
                                        <Badge variant={c.status === '修理完了' ? 'success' : 'secondary'}>
                                            {c.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 truncate max-w-[200px]">{c.issue_description}</td>
                                    <td className="p-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-muted-foreground hover:text-primary"
                                            onClick={() => handleRevert(c.id)}
                                            disabled={isPending && pendingId === c.id}
                                        >
                                            {isPending && pendingId === c.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                            ) : (
                                                <Undo className="w-4 h-4 mr-1" />
                                            )}
                                            戻す
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
