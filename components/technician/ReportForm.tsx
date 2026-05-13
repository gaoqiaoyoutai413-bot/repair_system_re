'use client';

import { RepairCase } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { updateVisitDate, completeRepair } from "@/lib/actions";
import { useState } from "react";
import { Loader2, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReportForm({ repairCase }: { repairCase: RepairCase }) {
    const router = useRouter();
    const [date, setDate] = useState(repairCase.visit_scheduled_at || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(repairCase.status === '修理完了');

    const handleDateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateVisitDate(repairCase.id, date);
        setIsLoading(false);
        alert("訪問日時を送信しました。ステータスが「対応中」になりました。");
        router.refresh();
    };

    const handleComplete = async () => {
        if (!confirm("修理完了として報告しますか？")) return;
        setIsLoading(true);
        await completeRepair(repairCase.id);
        setIsLoading(false);
        setIsCompleted(true);
    };

    if (isCompleted) {
        return (
            <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="flex justify-center text-green-600">
                        <CheckCircle size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">修理完了</h2>
                    <p className="text-green-600">お疲れ様でした。報告は完了しています。</p>

                    <div className="pt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/technician">
                                担当者ポータル（エリア選択）へ戻る
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Button asChild variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/technician">
                        <ArrowLeft size={20} /> エリア選択へ戻る
                    </Link>
                </Button>
            </div>

            {/* Case Details Card */}
            {/* Case Details Card */}
            <Card>
                <CardHeader>
                    <CardDescription>案件ID: {repairCase.id}</CardDescription>
                    <CardTitle className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm px-2 py-0.5 bg-muted rounded font-mono border">{repairCase.store_no}</span>
                            <span>{repairCase.store_name}</span>
                        </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                        {repairCase.address}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block text-xs">担当者</span>
                            <span className="font-medium">{repairCase.client_name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">電話番号</span>
                            <a href={`tel:${repairCase.phone}`} className="text-primary underline font-medium">{repairCase.phone}</a>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <div className="mb-2 pb-2 border-b border-gray-200">
                            <h3 className="font-semibold text-sm text-foreground mb-1">対象機器・型式</h3>
                            <p className="text-sm">{repairCase.target_equipment} {repairCase.model_info}</p>
                        </div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">故障内容</h3>
                        <p className="text-base whitespace-pre-wrap">{repairCase.issue_description}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Forms */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">ステータス更新</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Step 1: Visit Date */}
                    <form onSubmit={handleDateSubmit} className="space-y-3">
                        <label className="text-sm font-medium block">訪問予定日時を入力してください</label>
                        <div className="flex gap-2">
                            <input
                                type="datetime-local"
                                required
                                className="flex-1 h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Calendar className="mr-2" />}
                            訪問日時を送信
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            送信するとステータスが「対応中」になります
                        </p>
                    </form>

                    <div className="border-t border-border my-4"></div>

                    {/* Step 2: Complete */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium block text-muted-foreground">作業が終了したら押してください</label>
                        <Button

                            // I'll use inline class or default
                            className="w-full h-16 text-xl bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleComplete}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2" />}
                            修理完了報告
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
