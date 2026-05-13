'use client';

import { useState, useTransition } from "react";
import { RepairCase } from "@/types";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, FileText, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import Link from "next/link";
import { deleteCasePermanently } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CaseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    repairCase: RepairCase;
}

export function CaseDetailModal({ isOpen, onClose, repairCase }: CaseDetailModalProps) {
    const router = useRouter();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [deleteError, setDeleteError] = useState('');

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        案件詳細
                        <span className="text-sm font-normal text-muted-foreground ml-2">ID: {repairCase.id}</span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        案件の詳細情報と履歴を確認・編集します
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="p-4 bg-muted/20 rounded-lg space-y-1 mb-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">ID</label>
                            <div className="col-span-3 text-sm font-mono">{repairCase.id}</div>
                        </div>
                        {repairCase.category && repairCase.category !== 'Default' && repairCase.category !== 'Unknown' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium text-muted-foreground">案件種別</label>
                                <div className="col-span-3 text-sm">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground opacity-80">
                                        {repairCase.category}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">ステータス</label>
                            <div className="col-span-3">
                                <Badge variant="outline">{repairCase.status}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Store Info */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">店舗情報</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground block text-xs">店舗番号</span>{repairCase.store_no}</div>
                            <div><span className="text-muted-foreground block text-xs">店舗名</span>{repairCase.store_name}</div>
                            <div className="col-span-2"><span className="text-muted-foreground block text-xs">住所</span>{repairCase.address}</div>
                        </div>
                    </section>

                    {/* Client Info */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">担当者・連絡先</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground block text-xs">担当者名</span>{repairCase.client_name}</div>
                            <div><span className="text-muted-foreground block text-xs">電話番号</span>{repairCase.phone}</div>
                        </div>
                    </section>

                    {/* Issue Info */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">依頼内容</h3>
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-muted-foreground block text-xs">対象機器</span>{repairCase.target_equipment}</div>
                                <div><span className="text-muted-foreground block text-xs">型式</span>{repairCase.model_info}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">故障内容</span>
                                <div className="bg-muted p-3 rounded mt-1 whitespace-pre-wrap">{repairCase.issue_description}</div>
                            </div>
                        </div>
                    </section>

                    {/* Admin Note */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">管理者メモ</h3>
                        <div className="bg-yellow-50 p-3 rounded text-sm border border-yellow-100 whitespace-pre-wrap">
                            {repairCase.admin_note || '(なし)'}
                        </div>
                    </section>

                    {/* History - Simple dump for now */}
                    {repairCase.history && (
                        <section>
                            <h3 className="font-semibold text-lg border-b pb-2 mb-3">履歴ログ</h3>
                            <pre className="text-xs bg-slate-900 text-slate-50 p-3 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                                {repairCase.history}
                            </pre>
                        </section>
                    )}

                    {repairCase.attachment_link && (
                        <div className="pt-4 border-t">
                            <Button asChild className="w-full gap-2" variant="secondary">
                                <a href={repairCase.attachment_link} target="_blank" rel="noopener noreferrer">
                                    <FileText size={18} />
                                    添付ファイル・画像を確認する
                                </a>
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setDeleteError('');
                                setIsDeleteConfirmOpen(true);
                            }}
                        >
                            <Trash2 size={16} className="mr-1" />
                            完全削除
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/admin/edit/${repairCase.id}`}>
                                情報を編集する
                            </Link>
                        </Button>
                        <Button onClick={onClose}>閉じる</Button>
                    </div>
                </div>
            </DialogContent>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle size={18} />
                            案件を完全削除します
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            この操作は取り消せません。案件データは履歴ログに残さず削除されます。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                        <div className="font-semibold">削除対象</div>
                        <div className="mt-1 text-muted-foreground">
                            ID: {repairCase.id}
                        </div>
                        <div className="text-muted-foreground">
                            店舗: {repairCase.store_name || '(店舗名なし)'}
                        </div>
                    </div>
                    {deleteError && (
                        <p className="text-sm text-destructive">{deleteError}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteError('');
                                setIsDeleteConfirmOpen(false);
                            }}
                            disabled={isDeleting}
                        >
                            キャンセル
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                                startDeleteTransition(async () => {
                                    const result = await deleteCasePermanently(repairCase.id);
                                    if (!result.success) {
                                        setDeleteError(result.message || '完全削除に失敗しました');
                                        return;
                                    }

                                    setDeleteError('');
                                    setIsDeleteConfirmOpen(false);
                                    onClose();
                                    router.refresh();
                                });
                            }}
                        >
                            {isDeleting && <Loader2 size={16} className="mr-1 animate-spin" />}
                            完全削除を実行
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
