import Foundation

/// TypeScript版 features/calculation/logic.ts のSwiftポート
/// すべての関数がTypeScript版と1:1の対応を維持
enum InfusionCalculator {

  /// 滴/分を計算
  /// 公式: (volumeMl * dropsPerMl) / timeMinutes
  static func dropsPerMinute(volumeMl: Double, timeMinutes: Double, dropsPerMl: Int) -> Double {
    guard timeMinutes > 0, volumeMl > 0, dropsPerMl > 0 else { return 0 }
    return (volumeMl * Double(dropsPerMl)) / timeMinutes
  }

  /// 時間と分を合計分に変換
  static func hoursToMinutes(hours: Int, minutes: Int = 0) -> Int {
    return hours * 60 + minutes
  }

  /// 滴下間隔をミリ秒で計算
  static func dropInterval(dropsPerMinute: Double) -> Double {
    guard dropsPerMinute > 0 else { return 0 }
    return (60.0 * 1000.0) / dropsPerMinute
  }

  /// 総滴下数を計算
  static func totalDrops(volumeMl: Double, dropsPerMl: Int) -> Double {
    return volumeMl * Double(dropsPerMl)
  }

  /// 現在時刻から終了予定時刻を計算
  static func endTime(totalMinutes: Double) -> Date {
    return Date().addingTimeInterval(totalMinutes * 60)
  }

  /// DateをHH:MM形式の文字列にフォーマット
  static func formatTime(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm"
    return formatter.string(from: date)
  }
}
