import { RepairCase, CaseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { MapPin, Phone, User, Calendar, Wrench, Loader2, AlertTriangle } from "lucide-react";
import { updateCaseStatus } from "@/lib/actions";
import { useState, useTransition } from "react";
import { CaseDetailModal } from "./CaseDetailModal";
import Link from "next/link";

interface CaseCardProps {
    repairCase: RepairCase;
}

export function CaseCard({ repairCase }: CaseCardProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(repairCase.status);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const getStatusVariant = (s: string) => {
        switch (s) {
            case '未対応': return 'bg-destructive/90 text-destructive-foreground hover:bg-destructive/80';
            case '電話確認中': return 'bg-yellow-500/90 text-white hover:bg-yellow-500/80';
            case '対応中': return 'bg-primary/90 text-primary-foreground hover:bg-primary/80';
            case '依頼中': return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
            case '修理完了': return 'bg-green-600/90 text-white hover:bg-green-600/80';
            case '口頭完了': return 'bg-green-600/90 text-white hover:bg-green-600/80';
            default: return 'bg-slate-500 text-white';
        }
    };

    const handleStatusChange = (newStatus: string) => {
        const typedStatus = newStatus as CaseStatus;
        setStatus(typedStatus); // Optimistic update
        startTransition(async () => {
            await updateCaseStatus(repairCase.id, typedStatus);
        });
    };

    // Stale Check Logic
    const isStale = () => {
        // Statuses usually considered "not yet in progress" or "stalled"
        const pendingStatuses = ['未対応', '電話確認中', '依頼中'];
        if (!pendingStatuses.includes(status)) return false;

        if (!repairCase.received_at) return false;

        const receivedDate = new Date(repairCase.received_at);
        if (isNaN(receivedDate.getTime())) return false;

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - receivedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 5;
    };

    return (
        <>
            <Card className={`hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-border ${isStale() ? 'border-red-400 ring-1 ring-red-400/50' : ''}`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`relative inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${getStatusVariant(status)}`}>
                                {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                <select
                                    id={`status-select-${repairCase.id}`}
                                    name={`status-select-${repairCase.id}`}
                                    aria-label="ステータス変更"
                                    value={status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleStatusChange(e.target.value as any)}
                                    disabled={isPending}
                                    className="bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-1 pl-1 py-0 text-xs font-semibold w-full text-foreground/90"
                                >
                                    <option value="未対応">未対応</option>
                                    <option value="電話確認中">電話確認中</option>
                                    <option value="口頭完了">口頭完了</option>
                                    <option value="依頼中">依頼中</option>
                                    <option value="対応中">対応中</option>
                                    <option value="修理完了">修理完了</option>
                                </select>
                            </div>
                        </div>

                        {/* Received At Date w/ Stale Warning */}
                        <div className="flex items-center gap-1.5">
                            {isStale() && (
                                <div className="flex items-center text-red-500" title="受信から5日以上経過しています">
                                    <AlertTriangle size={16} />
                                </div>
                            )}
                            <span className={`text-xs ${isStale() ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{repairCase.received_at}</span>
                        </div>
                    </div>
                    <CardTitle className="text-lg mt-2 flex items-center gap-2">
                        <div className="font-bold">{repairCase.store_name}</div>
                        {repairCase.store_no && (
                            <span className="text-xs font-normal text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                                {repairCase.store_no}
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs mt-1">
                        <MapPin size={14} /> {repairCase.address}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-2">
                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                        <p className="font-semibold text-xs text-muted-foreground mb-1">
                            症状
                        </p>
                        <p className="line-clamp-3">{repairCase.issue_description}</p>

                        {(repairCase.target_equipment || repairCase.model_info || repairCase.sales_date) && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground">
                                    {repairCase.target_equipment} {repairCase.model_info}
                                    {repairCase.sales_date && <span className="ml-2">販売日: {repairCase.sales_date}</span>}
                                </p>
                            </div>
                        )}
                    </div>
                    {repairCase.assignee_name && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium border-t pt-2 mt-2">
                            <User size={14} /> 担当: {repairCase.assignee_name}
                        </div>
                    )}
                    {repairCase.visit_scheduled_at && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <Calendar size={14} /> 訪問: {repairCase.visit_scheduled_at}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-2 flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(true)}>詳細</Button>
                    {repairCase.assignee_name ? (
                        <Button asChild size="sm" variant="secondary">
                            <Link href={`/admin/assign/${repairCase.id}`}>
                                担当者変更
                            </Link>
                        </Button>
                    ) : status !== '修理完了' && status !== '口頭完了' ? (
                        <Button asChild size="sm">
                            <Link href={`/admin/assign/${repairCase.id}`}>
                                担当割り当て
                            </Link>
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>

            <CaseDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                repairCase={repairCase}
            />
        </>
    );
}
