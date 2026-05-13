'use client';

import { Technician, RepairCase } from "@/types";

// Assuming ScrollArea is standard div for now if I don't build it, 
// but sticking to standard overflow-y-auto is safer.

export function Sidebar({ technicians, cases = [] }: { technicians: Technician[], cases?: RepairCase[] }) {
    return (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-screen fixed left-0 top-0 pt-16 z-10">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-bold tracking-tight">担当者状況</h2>
                <p className="text-xs text-muted-foreground">現在稼働中の担当者: {technicians.length}名</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {technicians.map((tech) => {
                    // Check for cases assigned to this technician (matching name)
                    // Note: matching loosely by name inclusion as IDs aren't strictly linked in sheet currently
                    const techCases = cases.filter(c => c.assignee_name?.includes(tech.name));
                    const requestedCount = techCases.filter(c => c.status === '依頼中').length;
                    const inProgressCount = techCases.filter(c => c.status === '対応中').length;

                    return (
                        <div key={tech.id} className="flex flex-col space-y-1 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">{tech.name}</span>
                            </div>
                            <div className="flex gap-2 text-xs mt-1">
                                {requestedCount > 0 && (
                                    <span className="text-orange-600 font-medium">依頼: {requestedCount}</span>
                                )}
                                {inProgressCount > 0 && (
                                    <span className="text-blue-600 font-medium">対応: {inProgressCount}</span>
                                )}
                                {requestedCount === 0 && inProgressCount === 0 && (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                <div className="font-semibold text-xs mb-1">{tech.company_name}</div>
                                <span>{tech.area}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
