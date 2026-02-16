import WatchKit

/// watchOS用ハプティックフィードバックマネージャー
enum HapticManager {
  enum FeedbackType {
    case start       // 投与開始
    case stop        // 投与停止
    case endingSoon  // 終了間近
    case completed   // 投与完了
    case drip        // 滴下ごとのティック
  }

  static func play(_ type: FeedbackType) {
    let device = WKInterfaceDevice.current()

    switch type {
    case .start:
      device.play(.start)
    case .stop:
      device.play(.stop)
    case .endingSoon:
      device.play(.notification)
    case .completed:
      device.play(.success)
    case .drip:
      device.play(.click)
    }
  }
}
