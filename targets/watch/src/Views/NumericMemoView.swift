import SwiftUI

/// 数値メモ画面（看護師がその場で尿量・バイタル等をメモする）
struct NumericMemoView: View {
  // 入力バッファ（画面内一時保持）
  @State private var inputText: String = ""

  // 永続化（AppStorage = Watch UserDefaults）
  @AppStorage("numeric_memo_text") private var savedText: String = ""
  @AppStorage("numeric_memo_has_record") private var hasRecord: Bool = false
  @AppStorage("numeric_memo_saved_at") private var savedAt: Double = 0

  // 保存済み画面の表示フラグ
  @State private var showSaved: Bool = false

  // テンキーの最大文字数
  private let maxLength = 100

  var body: some View {
    if showSaved || (hasRecord && inputText.isEmpty) {
      savedView
    } else {
      inputView
    }
  }

  // MARK: - 入力中ビュー

  private var inputView: some View {
    VStack(spacing: 2) {
      // テキスト表示エリア
      // 注意: テンキー5行分の高さを確保しつつ、残りを表示エリアに割り当てる
      ScrollView {
        Text(inputText.isEmpty ? "数値を入力" : inputText)
          .font(.system(.caption, design: .monospaced))
          .foregroundColor(inputText.isEmpty ? .secondary : .primary)
          .frame(maxWidth: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
      }
      .frame(height: 30)
      .padding(.horizontal, 4)
      .background(Color.secondary.opacity(0.12))
      .cornerRadius(6)

      Divider()

      // テンキーグリッド（3列）
      // ボタン高さ22pt × 5行 + spacing 2pt × 4 = 118pt で画面に収まるサイズ
      LazyVGrid(
        columns: [
          GridItem(.flexible()),
          GridItem(.flexible()),
          GridItem(.flexible())
        ],
        spacing: 2
      ) {
        // 1〜9
        ForEach(1...9, id: \.self) { num in
          keyButton(label: "\(num)") {
            appendText("\(num)")
          }
        }

        // SP（スペース）
        keyButton(label: "SP", color: .blue.opacity(0.3)) {
          appendText(" ")
        }

        // 0
        keyButton(label: "0") {
          appendText("0")
        }

        // ⌫（バックスペース）
        keyButton(label: "⌫", color: .red.opacity(0.3)) {
          deleteLastChar()
        }

        // ↵（改行）
        keyButton(label: "↵", color: .blue.opacity(0.3)) {
          appendText("\n")
        }

        // 中央空白
        Color.clear
          .frame(height: 22)

        // ✓（保存）
        keyButton(label: "✓", color: .green.opacity(0.4)) {
          saveMemo()
        }
      }
    }
    .navigationTitle("数値メモ")
    .onAppear {
      // 保存済みデータがあれば入力バッファに読み込む
      if hasRecord && !savedText.isEmpty && inputText.isEmpty {
        inputText = savedText
      }
    }
  }

  // MARK: - 保存済みビュー

  private var savedView: some View {
    VStack(spacing: 8) {
      // 保存済みヘッダー
      HStack {
        Spacer()
        Label("保存済み", systemImage: "checkmark.circle.fill")
          .font(.caption2)
          .foregroundColor(.green)
        Spacer()
      }

      Divider()

      // 保存内容表示
      ScrollView {
        Text(savedText)
          .font(.system(.caption, design: .monospaced))
          .frame(maxWidth: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
      }
      .frame(maxHeight: .infinity)

      Spacer()

      // 消去ボタン
      Button(role: .destructive) {
        clearMemo()
      } label: {
        Text("消去する")
          .font(.caption2)
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.bordered)
      .tint(.red)
    }
    .navigationTitle("数値メモ")
  }

  // MARK: - テンキーボタン

  private func keyButton(
    label: String,
    color: Color = Color.secondary.opacity(0.2),
    action: @escaping () -> Void
  ) -> some View {
    Button(action: action) {
      Text(label)
        .font(.system(.caption, design: .monospaced))
        .fontWeight(.medium)
        .frame(maxWidth: .infinity)
        .frame(height: 22)
        .background(color)
        .cornerRadius(6)
    }
    .buttonStyle(.plain)
  }

  // MARK: - アクション

  /// 文字を末尾に追記（最大文字数チェックあり）
  private func appendText(_ char: String) {
    guard inputText.count < maxLength else { return }
    inputText += char
  }

  /// 末尾1文字（または改行）を削除
  private func deleteLastChar() {
    guard !inputText.isEmpty else { return }
    inputText.removeLast()
  }

  /// 現在の入力内容を保存
  private func saveMemo() {
    guard !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
    savedText = inputText
    savedAt = Date().timeIntervalSince1970
    hasRecord = true
    showSaved = true
    HapticManager.play(.completed)
  }

  /// 保存内容をすべて消去して入力画面に戻る
  private func clearMemo() {
    hasRecord = false
    savedText = ""
    inputText = ""
    showSaved = false
    HapticManager.play(.stop)
  }
}

#Preview {
  NavigationStack {
    NumericMemoView()
  }
}
