import { RepairCase } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";

interface TechnicianCaseCardProps {
    repairCase: RepairCase;
}

export function TechnicianCaseCard({ repairCase }: TechnicianCaseCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold">
                        <span className="bg-muted px-2 py-0.5 rounded text-sm mr-2 border">{repairCase.store_no}</span>
                        {repairCase.store_name}
                    </CardTitle>
                    <Badge variant={repairCase.status === '依頼中' ? 'destructive' : 'default'} className="shrink-0">
                        {repairCase.status}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin size={12} /> {repairCase.address}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-semibold">
                        <AlertCircle size={12} /> 故障内容
                    </div>
                    <p className="text-sm line-clamp-3">
                        {repairCase.issue_description}
                    </p>
                </div>
                {(repairCase.target_equipment || repairCase.model_info) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        機器: {repairCase.target_equipment} {repairCase.model_info}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                <Button asChild className="w-full gap-2">
                    <Link href={`/report/${repairCase.id}`}>
                        詳細・報告へ <ArrowRight size={16} />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
