# CLAUDE.md
## Git 運用
### ブランチ運用
- feature ブランチは `feature/<issue番号>` の形式で作成する
    - 例: `feature/#123`
- develop ブランチから分岐し、develop にマージする
- マージ後は feature ブランチを削除する

### コミット方針
- コミットメッセージは Semantic Commit Message に従い、末尾に必ず issue 番号を付ける
  - 例: `feat: エージェントの基本機能を実装 #1`
  - 主なプレフィックス: feat(新機能), fix(バグ修正), docs(ドキュメント), style(フォーマット), refactor(リファクタリング), test(テスト), chore(その他)
- 1つのコミットには1つの変更内容のみを含める（機能開発とリファクタリングを混ぜない）
- コミットが大きくなりすぎないよう適切な粒度で分割する

### Pull Request
- PR タイトルは対応する Issue のタイトル + issue 番号を使用する（例: `機能追加 #123`）
- PR の説明は日本語で記述する
- Development に Issue を紐付けて、マージ時に自動クローズされるようにする

## プロジェクト概要
@README.md

## テスト戦略
@docs/testing-strategy.md