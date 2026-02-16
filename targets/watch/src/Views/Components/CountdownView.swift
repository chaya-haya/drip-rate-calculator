import SwiftUI

/// 投与中のカウントダウンタイマー表示
struct CountdownView: View {
  let patient: WatchPatient

  var body: some View {
    if let endTime = patient.endTime, endTime > Date() {
      VStack(spacing: 4) {
        // ライブ残り時間（自動更新、再レンダリング不要）
        Text(timerInterval: Date()...endTime, countsDown: true)
          .font(.system(.title3, design: .monospaced))
          .fontWeight(.bold)
          .foregroundColor(patient.status == .endingSoon ? .orange : .primary)

        // 終了予定時刻
        Text("終了 \(InfusionCalculator.formatTime(endTime))")
          .font(.caption2)
          .foregroundColor(.secondary)

        // 滴下速度
        Text(String(format: "%.1f 滴/分", patient.dropsPerMinute))
          .font(.caption2)
          .foregroundColor(.blue)
      }
    }
  }
}
