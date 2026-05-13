'use client';

import { RepairCase, Technician } from "@/types";
import { CaseCard } from "@/components/admin/CaseCard";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DashboardClient({ cases, technicians }: { cases: RepairCase[], technicians: Technician[] }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCases = cases.filter(c => {
        // 1. Keyword Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match = (
                (c.store_name || '').toLowerCase().includes(q) ||
                (c.client_name || '').toLowerCase().includes(q) ||
                (c.address || '').toLowerCase().includes(q)
            );
            if (!match) return false;
        }

        const caseDate = c.received_at ? new Date(c.received_at) : null;
        if (!caseDate) return false;

        // 2. Date Filter
        // Default: Show ONLY past 3 months if no date filter AND no search query is set
        // (If searching, we want to scan all history unless date is restricted)
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

    return (
        <>
            <div className="bg-card p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="grid gap-1.5">
                    <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        開始日
                    </label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-1.5">
                    <label htmlFor="endDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        終了日
                    </label>
                    <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-1.5 min-w-[200px]">
                    <label htmlFor="searchQuery" className="text-sm font-medium leading-none">
                        キーワード検索 (店舗名・担当者・住所)
                    </label>
                    <input
                        id="searchQuery"
                        name="searchQuery"
                        type="text"
                        placeholder="例: マクドナルド"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCases.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        該当する案件はありません。
                    </div>
                ) : (
                    filteredCases.map((repairCase) => (
                        <CaseCard
                            key={repairCase.id}
                            repairCase={repairCase}
                        />
                    ))
                )}
            </div>
        </>
    );
}
