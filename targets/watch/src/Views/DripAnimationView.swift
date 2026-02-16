import SwiftUI

/// watchOS用リップルアニメーション（水波紋の広がりエフェクト）
struct DripAnimationView: View {
  let dropInterval: Double // ミリ秒
  let isActive: Bool
  var hapticEnabled: Bool = false

  private let minInterval: Double = 200

  private var effectiveInterval: TimeInterval {
    max(dropInterval, minInterval) / 1000.0
  }

  var body: some View {
    if isActive && dropInterval > 0 {
      TimelineView(.periodic(from: .now, by: effectiveInterval)) { timeline in
        RippleView(date: timeline.date, duration: effectiveInterval * 0.9, hapticEnabled: hapticEnabled)
      }
    } else {
      Image(systemName: "drop.fill")
        .font(.title3)
        .foregroundColor(.blue.opacity(0.3))
    }
  }
}

/// 波紋拡散アニメーション
private struct RippleView: View {
  let date: Date
  let duration: TimeInterval
  let hapticEnabled: Bool

  @State private var ripple1: CGFloat = 0
  @State private var ripple2: CGFloat = 0
  @State private var dropScale: CGFloat = 1.0

  var body: some View {
    ZStack {
      // 外側の波紋（遅延あり）
      Circle()
        .stroke(Color.cyan.opacity(0.6 * (1.0 - ripple2)), lineWidth: 3)
        .frame(width: 70, height: 70)
        .scaleEffect(0.3 + ripple2 * 0.7)

      // 内側の波紋
      Circle()
        .stroke(Color.blue.opacity(0.8 * (1.0 - ripple1)), lineWidth: 3.5)
        .frame(width: 70, height: 70)
        .scaleEffect(0.3 + ripple1 * 0.7)

      // グロー波紋（薄いfill）
      Circle()
        .fill(Color.blue.opacity(0.15 * (1.0 - ripple1)))
        .frame(width: 70, height: 70)
        .scaleEffect(0.3 + ripple1 * 0.5)

      // 中央のドロップ
      Image(systemName: "drop.fill")
        .font(.system(size: 24))
        .foregroundColor(.blue)
        .scaleEffect(dropScale)
    }
    .clipped(antialiased: false)
    .onChange(of: date) {
      // 滴下ごとのハプティックフィードバック
      if hapticEnabled {
        HapticManager.play(.drip)
      }

      // リセット
      ripple1 = 0
      ripple2 = 0
      dropScale = 1.2

      // ドロップバウンス
      withAnimation(.easeOut(duration: duration * 0.3)) {
        dropScale = 0.8
      }

      // 内側波紋
      withAnimation(.easeOut(duration: duration * 0.8)) {
        ripple1 = 1
      }

      // 外側波紋（やや遅延）
      withAnimation(.easeOut(duration: duration * 0.8).delay(duration * 0.15)) {
        ripple2 = 1
      }
    }
    .onAppear {
      withAnimation(.easeOut(duration: duration * 0.8)) {
        ripple1 = 1
      }
      withAnimation(.easeOut(duration: duration * 0.8).delay(duration * 0.15)) {
        ripple2 = 1
      }
    }
  }
}
