import Link from "next/link";
import { Wrench, ShieldCheck, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            修理進捗管理システム
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Repair Progress Management System
          </p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/admin"
            className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group text-left"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">管理者ダッシュボード</h3>
              <p className="text-sm text-zinc-500">案件管理 / 担当者割り当て</p>
            </div>
          </Link>

          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-left">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-zinc-400" />
              <h3 className="font-semibold text-zinc-500">担当者報告ページ</h3>
            </div>
            <p className="text-xs text-zinc-400">
              ※ 各案件の個別URL（メールリンク等）からアクセスしてください。<br />
              デモ用: <Link href="/report/1" className="underline hover:text-blue-500">/report/1</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
