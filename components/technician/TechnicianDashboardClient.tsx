'use client';

import { useState, useMemo } from 'react';
import { Technician, RepairCase } from "@/types";
import { TechnicianCaseCard } from "./TechnicianCaseCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface TechnicianDashboardClientProps {
    cases: RepairCase[];
    technicians: Technician[];
}

export function TechnicianDashboardClient({ cases, technicians }: TechnicianDashboardClientProps) {
    const [selectedArea, setSelectedArea] = useState<string>('');

    // Extract unique areas
    const uniqueAreas = useMemo(() => {
        const areas = technicians.map(t => t.area).filter(Boolean);
        return Array.from(new Set(areas));
    }, [technicians]);

    // Filter Logic
    const filteredCases = useMemo(() => {
        if (!selectedArea) return [];

        // Find all techs in this area
        const techsInArea = technicians.filter(t => t.area === selectedArea);
        if (techsInArea.length === 0) return [];

        return cases.filter(c => {
            // Exclude completed
            if (c.status === '修理完了' || c.status === '口頭完了') return false;

            // Check assignment
            if (!c.assignee_name) return false;

            // Check if assignee matches ANY tech in this area
            // We match loosely: if case assignee string contains the tech name
            return techsInArea.some(tech => (c.assignee_name || '').includes(tech.name));
        });
    }, [cases, technicians, selectedArea]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Selector */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl text-center mb-4">担当エリアを選択してください</CardTitle>
                    <div className="max-w-md mx-auto">
                        <select
                            id="area-select"
                            name="area-select"
                            className="w-full h-12 px-4 rounded-md border border-input bg-background"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                        >
                            <option value="">-- エリアを選択 --</option>
                            {uniqueAreas.map(area => (
                                <option key={area} value={area}>
                                    {area}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
            </Card>

            {/* Case List */}
            {selectedArea && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {selectedArea}エリアの担当案件
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                            {filteredCases.length}件
                        </span>
                    </h2>

                    {filteredCases.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCases.map(c => (
                                <TechnicianCaseCard key={c.id} repairCase={c} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                            担当中の未完了案件はありません
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
