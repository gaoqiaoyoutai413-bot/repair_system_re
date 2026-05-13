'use client';

import { assignTechnician } from "@/lib/actions";
import { Technician, RepairCase } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { Check, Mail, MessageCircle, Printer, Phone, User, ArrowLeft } from "lucide-react";
import { isTechnicianRecommended } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface AssignTechnicianPageClientProps {
    repairCase: RepairCase;
    technicians: Technician[];
}

export function AssignTechnicianPageClient({ repairCase, technicians }: AssignTechnicianPageClientProps) {
    const router = useRouter();
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Recommendation Logic
    const recommendedTechs = technicians.filter(t => isTechnicianRecommended(repairCase, t));
    const otherTechs = technicians.filter(t => !recommendedTechs.includes(t));

    const getContactAction = (tech: Technician) => {
        if (tech.email && tech.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return { type: 'EMAIL', label: 'メールで依頼', icon: Mail, value: tech.email };
        }
        const contactInfo = (tech.email + ' ' + tech.phone).toUpperCase();
        if (contactInfo.includes('LINE')) {
            return { type: 'LINE', label: 'LINEで連絡', icon: MessageCircle, value: tech.email || tech.phone };
        }
        if (contactInfo.includes('FAX')) {
            return { type: 'FAX', label: 'FAXを送信', icon: Printer, value: tech.phone };
        }
        if (tech.phone) {
            return { type: 'PHONE', label: '電話で連絡', icon: Phone, value: tech.phone };
        }
        return { type: 'OTHER', label: '連絡先不明', icon: User, value: '' };
    };

    const selectedTech = technicians.find(t => t.id === selectedTechId);
    const action = selectedTech ? getContactAction(selectedTech) : null;

    const handleAssign = async () => {
        if (!selectedTech || !action) return;
        setIsSubmitting(true);

        const assigneeString = `${selectedTech.company_name} ${selectedTech.name}`;
        const result = await assignTechnician(repairCase.id, assigneeString);

        if (!result.success) {
            alert('エラー: ' + result.message);
            setIsSubmitting(false);
            return;
        }

        let message = `担当者: ${assigneeString} を割り当てました。\nステータスを「依頼中」に更新しました。`;

        switch (action.type) {
            case 'EMAIL':
                message += `\n\n【連絡手段: メール】\nメーラーを起動します: ${action.value}`;
                break;
            case 'LINE':
                message += `\n\n【連絡手段: LINE】\nLINEで連絡してください。\nID/No: ${action.value}`;
                break;
            case 'FAX':
                message += `\n\n【連絡手段: FAX】\nFAXを送信してください。\n番号: ${action.value}`;
                break;
            case 'PHONE':
                message += `\n\n【連絡手段: 電話】\n電話で連絡してください。\n番号: ${action.value}`;
                break;
        }

        alert(message);
        router.refresh();
        router.push('/admin');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/admin">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">担当者の割り当て</h1>
                    <p className="text-muted-foreground">
                        案件: {repairCase.store_name} ({repairCase.address})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Case Info Side Panel (Optional or just summary) */}
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">案件情報</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div><span className="text-muted-foreground block text-xs">店舗名</span>{repairCase.store_name}</div>
                            <div><span className="text-muted-foreground block text-xs">住所</span>{repairCase.address}</div>
                            <div><span className="text-muted-foreground block text-xs">故障内容</span>{repairCase.issue_description}</div>
                        </CardContent>
                    </Card>

                    {selectedTech && action && (
                        <Card className="border-primary/50 bg-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-primary">選択中の担当者</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="font-bold text-lg">{selectedTech.name}</div>
                                <div className="text-sm">
                                    {selectedTech.company_name}<br />
                                    {selectedTech.area}
                                </div>
                                <div className="pt-2 border-t border-primary/20">
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <action.icon size={18} />
                                        {action.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 break-all">
                                        {action.value}
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={handleAssign} disabled={isSubmitting}>
                                    {isSubmitting ? '処理中...' : 'この担当者に依頼する'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Technician Selection List */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Check className="text-green-500" size={16} /> 推奨担当者 (エリア一致)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recommendedTechs.length > 0 ? recommendedTechs.map(tech => (
                                <TechButton
                                    key={tech.id}
                                    tech={tech}
                                    isSelected={selectedTechId === tech.id}
                                    onClick={() => setSelectedTechId(tech.id)}
                                    isRecommended
                                />
                            )) : <p className="text-sm text-muted-foreground p-4 bg-muted/20 rounded">推奨担当者はいません</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 border-t pt-4">
                            その他の担当者
                        </h3>
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
        relative flex flex-col items-start p-4 rounded-lg border text-left transition-all hover:bg-muted/50
        ${isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'}
      `}
        >
            <div className="flex justify-between w-full mb-1">
                <span className="font-bold text-sm">{tech.name}</span>
                {isRecommended && <Badge variant="default" className="bg-green-600 text-[10px] px-1 py-0 h-5">エリア推奨</Badge>}
            </div>
            <div className="text-xs text-muted-foreground w-full grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="col-span-2 font-semibold text-foreground">{tech.company_name}</div>
                <div>エリア: {tech.area}</div>
                <div>連絡先: {tech.phone}</div>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
                {tech.detergent && <Badge variant="outline" className="text-[10px]">洗剤: {tech.detergent}</Badge>}
                {tech.machine && <Badge variant="outline" className="text-[10px]">洗浄機: {tech.machine}</Badge>}
            </div>
            <div className="mt-2 pt-2 border-t w-full flex gap-2 text-[11px] justify-between">
                <div className="font-semibold text-orange-600">
                    依頼: {tech.requested_cases || 0}
                </div>
                <div className="font-semibold text-blue-600">
                    対応: {tech.current_active_cases}
                </div>
                <div className="text-muted-foreground">
                    完了: {tech.completed_cases || 0}
                </div>
            </div>
            {isSelected && (
                <div className="absolute top-3 right-3 text-primary bg-background rounded-full border border-primary p-0.5">
                    <Check size={12} />
                </div>
            )}
        </button>
    )
}
