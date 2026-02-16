import Foundation

/// iPhoneから受信する患者データ
struct WatchPatient: Identifiable, Codable {
  let id: String
  let roomNumber: String
  let bedNumber: String
  let infusionSetType: InfusionSetType
  let dropsPerMl: Int
  let volume: Double
  let totalMinutes: Double
  var isRunning: Bool
  var startedAt: Date?
  var endTime: Date?
  var dropsPerMinute: Double
  var dropInterval: Double // ミリ秒
  var hapticEnabled: Bool

  enum InfusionSetType: String, Codable {
    case adult
    case pediatric

    var displayName: String {
      switch self {
      case .adult: return "成人用"
      case .pediatric: return "小児用"
      }
    }
  }

  /// 投与状態と時間に基づく現在のステータス
  var status: PatientStatus {
    guard isRunning, let endTime = endTime else {
      return .waiting
    }
    let remaining = endTime.timeIntervalSinceNow
    if remaining <= 0 {
      return .completed
    }
    if remaining <= 5 * 60 { // 5分
      return .endingSoon
    }
    return .running
  }

  /// 残り時間（秒）。投与中でなければnil
  var remainingSeconds: TimeInterval? {
    guard isRunning, let endTime = endTime else { return nil }
    return max(0, endTime.timeIntervalSinceNow)
  }

  /// 表示用の患者名（号室＋ベッド番号）
  var displayName: String {
    if roomNumber.isEmpty && bedNumber.isEmpty {
      return "患者"
    }
    if bedNumber.isEmpty {
      return "\(roomNumber)号室"
    }
    return "\(roomNumber)号室 \(bedNumber)番"
  }

  /// ISO 8601文字列からDateをパース（小数秒あり/なし両対応）
  private static func parseISO8601(_ string: String) -> Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = formatter.date(from: string) { return date }
    formatter.formatOptions = [.withInternetDateTime]
    return formatter.date(from: string)
  }

  /// WatchConnectivity経由で受信したdictionaryから生成
  static func fromDictionary(_ dict: [String: Any]) -> WatchPatient? {
    guard
      let id = dict["id"] as? String,
      let roomNumber = dict["roomNumber"] as? String,
      let bedNumber = dict["bedNumber"] as? String,
      let setTypeStr = dict["infusionSetType"] as? String,
      let infusionSetType = InfusionSetType(rawValue: setTypeStr),
      let dropsPerMlNumber = dict["dropsPerMl"] as? NSNumber,
      let volume = dict["volume"] as? Double,
      let totalMinutes = dict["totalMinutes"] as? Double,
      let isRunning = dict["isRunning"] as? Bool,
      let dropsPerMinute = dict["dropsPerMinute"] as? Double,
      let dropInterval = dict["dropInterval"] as? Double
    else {
      return nil
    }

    let dropsPerMl = dropsPerMlNumber.intValue
    let hapticEnabled = (dict["hapticEnabled"] as? Bool) ?? false

    var startedAt: Date?
    if let startedAtStr = dict["startedAt"] as? String {
      startedAt = parseISO8601(startedAtStr)
    }

    var endTime: Date?
    if let endTimeStr = dict["endTime"] as? String {
      endTime = parseISO8601(endTimeStr)
    }

    return WatchPatient(
      id: id,
      roomNumber: roomNumber,
      bedNumber: bedNumber,
      infusionSetType: infusionSetType,
      dropsPerMl: dropsPerMl,
      volume: volume,
      totalMinutes: totalMinutes,
      isRunning: isRunning,
      startedAt: startedAt,
      endTime: endTime,
      dropsPerMinute: dropsPerMinute,
      dropInterval: dropInterval,
      hapticEnabled: hapticEnabled
    )
  }
}

/// iPhoneアプリと一致する患者ステータス列挙型
enum PatientStatus: String {
  case waiting
  case running
  case endingSoon = "ending_soon"
  case completed

  var label: String {
    switch self {
    case .waiting: return "待機中"
    case .running: return "実行中"
    case .endingSoon: return "終了間近"
    case .completed: return "完了"
    }
  }

  var color: String {
    switch self {
    case .waiting: return "gray"
    case .running: return "green"
    case .endingSoon: return "orange"
    case .completed: return "blue"
    }
  }
}
