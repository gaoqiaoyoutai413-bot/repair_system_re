'use client';

import { assignTechnician } from "@/lib/actions";
import { Technician, RepairCase } from "@/types";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { Check, Mail, MessageCircle, Printer, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified Modal since I didn't create a full Dialog UI library
// I'll create a visible overlay if isOpen is true

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCase: RepairCase | null;
    technicians: Technician[];
}

import { isTechnicianRecommended } from "@/lib/utils";

export function AssignModal({ isOpen, onClose, selectedCase, technicians }: AssignModalProps) {
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

    if (!isOpen || !selectedCase) return null;

    // Recommendation Logic (Updated to use Store Name & Regional matching)
    const recommendedTechs = technicians.filter(t => isTechnicianRecommended(selectedCase, t));
    const otherTechs = technicians.filter(t => !recommendedTechs.includes(t));

    const sortedTechs = [
        ...recommendedTechs.sort((a, b) => a.current_active_cases - b.current_active_cases),
        ...otherTechs.sort((a, b) => a.current_active_cases - b.current_active_cases)
    ];

    const getContactAction = (tech: Technician) => {
        // Prioritize Email column if it exists and looks like an email
        if (tech.email && tech.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return { type: 'EMAIL', label: 'メールで依頼', icon: Mail, value: tech.email };
        }

        // Check for specific keywords in Email or Phone columns
        const contactInfo = (tech.email + ' ' + tech.phone).toUpperCase();

        if (contactInfo.includes('LINE')) {
            return { type: 'LINE', label: 'LINEで連絡', icon: MessageCircle, value: tech.email || tech.phone }; // Assume ID might be in email field if not standard
        }

        if (contactInfo.includes('FAX')) {
            return { type: 'FAX', label: 'FAXを送信', icon: Printer, value: tech.phone }; // Assume FAX number is in phone
        }

        // Default to Phone if phone exists
        if (tech.phone) {
            return { type: 'PHONE', label: '電話で連絡', icon: Phone, value: tech.phone };
        }

        // Fallback
        return { type: 'OTHER', label: '連絡先不明', icon: User, value: '' };
    };

    const selectedTech = technicians.find(t => t.id === selectedTechId);
    const action = selectedTech ? getContactAction(selectedTech) : null;

    const handleAssign = async () => {
        if (!selectedTech || !action || !selectedCase) return;

        // Save "Company Name Technician Name" to the sheet
        const assigneeString = `${selectedTech.company_name} ${selectedTech.name}`;

        // Call Server Action
        const result = await assignTechnician(selectedCase.id, assigneeString);

        if (!result.success) {
            alert('エラー: ' + result.message);
            return;
        }

        let message = `担当者: ${assigneeString} を割り当てました。\nステータスを「依頼中」に更新しました。`;

        switch (action.type) {
            case 'EMAIL':
                message += `\n\n【連絡手段: メール】\nメーラーを起動します: ${action.value}`; // Updated message
                // window.location.href = `mailto:${action.value}...`;
                break;
            case 'LINE':
                message += `\n\n【連絡手段: LINE】\nLINEで連絡してください。\nID/No: ${action.value}`; // Updated message
                break;
            case 'FAX':
                message += `\n\n【連絡手段: FAX】\nFAXを送信してください。\n番号: ${action.value}`; // Updated message
                break;
            case 'PHONE':
                message += `\n\n【連絡手段: 電話】\n電話で連絡してください。\n番号: ${action.value}`; // Updated message
                break;
        }

        alert(message);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card text-card-foreground w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold">担当者の割り当て</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        案件: {selectedCase.client_name} ({selectedCase.address})
                    </p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">推奨担当者 (エリア一致)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recommendedTechs.length > 0 ? recommendedTechs.map(tech => (
                            <TechButton
                                key={tech.id}
                                tech={tech}
                                isSelected={selectedTechId === tech.id}
                                onClick={() => setSelectedTechId(tech.id)}
                                isRecommended
                            />
                        )) : <p className="text-sm text-muted-foreground col-span-2">推奨担当者はいません</p>}
                    </div>

                    <h3 className="text-sm font-semibold text-muted-foreground pt-4">その他の担当者</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {otherTechs.map(tech => (
                            <TechButton
                                key={tech.id}
                                tech={tech}
                                isSelected={selectedTechId === tech.id}
                                onClick={() => setSelectedTechId(tech.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>キャンセル</Button>
                    <Button
                        disabled={!selectedTechId}
                        onClick={handleAssign}
                        className="gap-2 min-w-[120px]" // Updated className
                    >
                        <User size={16} /> 依頼する {/* Updated button content */}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function TechButton({ tech, isSelected, onClick, isRecommended }: { tech: Technician, isSelected: boolean, onClick: () => void, isRecommended?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`
        relative flex flex-col items-start p-4 rounded-lg border text-left transition-all
        ${isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:bg-muted/50 hover:border-primary/50'}
      `}
        >
            <div className="flex justify-between w-full mb-1">
                <span className="font-bold text-sm">{tech.name}</span>
                {isRecommended && <Badge variant="success" className="text-[10px] px-1 py-0 h-5">エリア推奨</Badge>}
            </div>
            <div className="text-xs text-muted-foreground w-full">
                <div className="font-semibold text-foreground mb-1">{tech.company_name}</div>
                <div>エリア: {tech.area}</div>
                <div>連絡先: {tech.phone}</div>
                <div className="mt-2 flex gap-1 flex-wrap">
                    {tech.detergent && <Badge variant="outline" className="text-[10px]">洗剤</Badge>}
                    {tech.machine && <Badge variant="outline" className="text-[10px]">洗浄機</Badge>}
                </div>
            </div>
            {isSelected && (
                <div className="absolute top-2 right-2 text-primary">
                    <Check size={16} />
                </div>
            )}
        </button>
    )
}
