# 修理進捗管理システム

Google Sheets をデータベースとして利用する、修理案件の受付・担当者割り当て・現場報告を一元管理する Web アプリケーションです。就職活動のポートフォリオとして公開できるよう、リポジトリ内のデモ表示はすべて架空のテストデータにしています。

## 概要

修理依頼の受付後、管理者が案件の進捗を確認し、対応エリアに合う担当者へ割り当てます。担当者は個別の報告ページから訪問予定日時や完了報告を送信でき、更新内容は Google Sheets に反映されます。

環境変数が未設定の場合は、アプリ内のテストデータで動作確認できます。

## 主な機能

- 管理者ダッシュボードで未完了案件を一覧表示
- ステータス更新: 未対応、電話確認中、依頼中、対応中、修理完了、口頭完了
- 店舗名・担当者・住所によるキーワード検索と日付絞り込み
- 担当エリアをもとにした担当者推薦
- 担当者向け報告フォームで訪問予定日時と完了報告を登録
- Google Sheets API による案件・担当者データの参照と更新
- Google Drive フォルダ配下の複数スプレッドシート取得にも対応

## 技術スタック

- Next.js 16 / App Router
- React 19
- TypeScript
- Tailwind CSS
- Google Sheets API
- Google Drive API
- Cloud Run / Docker 対応

## 画面

- `/` : トップページ
- `/admin` : 管理者ダッシュボード
- `/admin/create` : 案件作成
- `/admin/history` : 完了案件履歴
- `/admin/assign/[id]` : 担当者割り当て
- `/report/[id]` : 担当者向け報告フォーム
- `/technician` : 担当者ポータル

## ローカル実行

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

Google Sheets の認証情報がない場合でも、デモ用テストデータで `/admin` と `/report/1` を確認できます。

## 環境変数

`.env.example` を参考に `.env.local` を作成します。

```bash
cp .env.example .env.local
```

主な設定値:

- `GOOGLE_SHEET_ID` : 案件と担当者を同じスプレッドシートで管理する場合の ID
- `GOOGLE_SHEET_ID_CASES` : 案件管理用スプレッドシート ID
- `GOOGLE_SHEET_ID_TECHNICIANS` : 担当者管理用スプレッドシート ID
- `GOOGLE_DRIVE_FOLDER_ID_CASES` : 案件スプレッドシートを複数管理する Drive フォルダ ID
- `GOOGLE_CLIENT_EMAIL` : Google サービスアカウントのメールアドレス
- `GOOGLE_PRIVATE_KEY` : Google サービスアカウントの秘密鍵

## テストデータ投入

Google Sheets へポートフォリオ用の架空データを投入する場合:

```bash
npm run seed
```

`scripts/seed.js` は以下を追加します。

- `cases` シート: 8 件の修理案件テストデータ（未完了6件、履歴ログ用の完了2件）
- `technicians` シート: 6 件の担当者テストデータ

既存データを削除せず末尾に追加します。公開用デモ環境では、実名・実住所・実電話番号を含むデータを使わないでください。

## Google Sheets の列構成

`cases` シート:

| 列 | 内容 |
| --- | --- |
| A | 受付日時 |
| B | 送信元 |
| C | 件名 |
| D | 店舗番号 |
| E | 店舗名 |
| F | 店舗担当者 |
| G | 電話番号 |
| H | 住所 |
| I | 対象機器 |
| J | 症状 |
| K | 管理メモ |
| L | 型式 |
| M | 販売日 |
| N | 履歴 |
| O | 添付リンク |
| P | ステータス |
| Q | 作業担当者 |
| R | 訪問予定日時 |

`technicians` シート:

| 列 | 内容 |
| --- | --- |
| A | 対応エリア |
| B | 会社名 |
| C | 担当者名 |
| D | 洗剤対応 |
| E | 洗浄機対応 |
| F | 連絡先 |
| G | メールアドレス |

## 公開時の注意

- `.env.local` や秘密鍵はコミットしない
- Google Sheets 側の共有権限を必要最小限にする
- 実顧客名、実住所、実電話番号、実メールアドレスを公開デモに含めない
- デモ環境では `scripts/seed.js` の架空データ、または `lib/googleSheets.ts` のフォールバックデータを利用する
