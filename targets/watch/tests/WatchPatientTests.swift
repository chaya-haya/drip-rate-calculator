import XCTest
@testable import DripWatch

// MARK: - WatchPatientRemainingSecondsTests

final class WatchPatientRemainingSecondsTests: XCTestCase {
  private func makePatient(isRunning: Bool, endTime: Date?) -> WatchPatient {
    WatchPatient(
      id: "test", roomNumber: "101", bedNumber: "1",
      infusionSetType: .adult, dropsPerMl: 20,
      volume: 500, totalMinutes: 60,
      isRunning: isRunning, startedAt: isRunning ? Date() : nil,
      endTime: endTime, dropsPerMinute: 10, dropInterval: 6000,
      hapticEnabled: false
    )
  }

  // isRunning=false → nil
  func testNotRunning_returnsNil() {
    let p = makePatient(isRunning: false, endTime: Date().addingTimeInterval(60))
    XCTAssertNil(p.remainingSeconds)
  }

  // endTime=nil, isRunning=true → nil
  func testRunningNoEndTime_returnsNil() {
    let p = makePatient(isRunning: true, endTime: nil)
    XCTAssertNil(p.remainingSeconds)
  }

  // endTime が未来60秒・isRunning=true → 約60秒（誤差1秒以内）
  func testRunningFutureEndTime_returnsApproxSeconds() throws {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(60))
    let remaining = try XCTUnwrap(p.remainingSeconds)
    XCTAssertEqual(remaining, 60, accuracy: 1.0)
  }

  // endTime が過去・isRunning=true → 0（max(0,...) ガード確認）
  func testRunningPastEndTime_returnsZero() throws {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(-10))
    let remaining = try XCTUnwrap(p.remainingSeconds)
    XCTAssertEqual(remaining, 0)
  }
}

// MARK: - WatchPatientDisplayNameTests

final class WatchPatientDisplayNameTests: XCTestCase {
  private func makePatient(roomNumber: String, bedNumber: String) -> WatchPatient {
    WatchPatient(
      id: "test", roomNumber: roomNumber, bedNumber: bedNumber,
      infusionSetType: .adult, dropsPerMl: 20,
      volume: 500, totalMinutes: 60,
      isRunning: false, startedAt: nil,
      endTime: nil, dropsPerMinute: 10, dropInterval: 6000,
      hapticEnabled: false
    )
  }

  // roomNumber と bedNumber が両方空 → "患者"
  func testBothEmpty_returnsDefault() {
    let p = makePatient(roomNumber: "", bedNumber: "")
    XCTAssertEqual(p.displayName, "患者")
  }

  // bedNumber のみ空 → "101号室"
  func testBedNumberEmpty_returnsRoomOnly() {
    let p = makePatient(roomNumber: "101", bedNumber: "")
    XCTAssertEqual(p.displayName, "101号室")
  }

  // 両方に値あり → "101号室 1番"
  func testBothPresent_returnsFullName() {
    let p = makePatient(roomNumber: "101", bedNumber: "1")
    XCTAssertEqual(p.displayName, "101号室 1番")
  }
}

// MARK: - WatchPatientFromDictionaryTests

final class WatchPatientFromDictionaryTests: XCTestCase {
  // 完全な辞書（全フィールドあり）→ パース成功・各フィールド正確
  func testCompleteDict_parsesAllFields() throws {
    let dict: [String: Any] = [
      "id": "abc",
      "roomNumber": "201",
      "bedNumber": "3",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 120.0,
      "isRunning": true,
      "dropsPerMinute": 83.33,
      "dropInterval": 720.0,
      "hapticEnabled": true
    ]
    let p = try XCTUnwrap(WatchPatient.fromDictionary(dict))
    XCTAssertEqual(p.id, "abc")
    XCTAssertEqual(p.roomNumber, "201")
    XCTAssertEqual(p.bedNumber, "3")
    XCTAssertEqual(p.infusionSetType, .adult)
    XCTAssertEqual(p.dropsPerMl, 20)
    XCTAssertEqual(p.volume, 500.0)
    XCTAssertEqual(p.totalMinutes, 120.0)
    XCTAssertTrue(p.isRunning)
    XCTAssertEqual(p.dropsPerMinute, 83.33, accuracy: 0.001)
    XCTAssertEqual(p.dropInterval, 720.0)
    XCTAssertTrue(p.hapticEnabled)
  }

  // hapticEnabled 省略 → デフォルト false
  func testHapticEnabledOmitted_defaultsFalse() throws {
    let dict: [String: Any] = [
      "id": "abc",
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      "isRunning": false,
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0
      // hapticEnabled は省略
    ]
    let p = try XCTUnwrap(WatchPatient.fromDictionary(dict))
    XCTAssertFalse(p.hapticEnabled)
  }

  // startedAt・endTime の ISO 8601 パース（小数秒あり/なし）
  func testISO8601Parsing_withAndWithoutFractionalSeconds() throws {
    let dictNoFrac: [String: Any] = [
      "id": "abc",
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      "isRunning": true,
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0,
      "startedAt": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z"
    ]
    let p1 = try XCTUnwrap(WatchPatient.fromDictionary(dictNoFrac))
    XCTAssertNotNil(p1.startedAt)
    XCTAssertNotNil(p1.endTime)

    let dictWithFrac: [String: Any] = [
      "id": "abc",
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      "isRunning": true,
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0,
      "startedAt": "2024-01-15T10:00:00.123Z",
      "endTime": "2024-01-15T11:00:00.456Z"
    ]
    let p2 = try XCTUnwrap(WatchPatient.fromDictionary(dictWithFrac))
    XCTAssertNotNil(p2.startedAt)
    XCTAssertNotNil(p2.endTime)
  }

  // 無効な infusionSetType rawValue → nil
  func testInvalidInfusionSetType_returnsNil() {
    let dict: [String: Any] = [
      "id": "abc",
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "invalid_type",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      "isRunning": false,
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0
    ]
    XCTAssertNil(WatchPatient.fromDictionary(dict))
  }

  // 必須フィールド（id）欠落 → nil
  func testMissingId_returnsNil() {
    let dict: [String: Any] = [
      // "id" は省略
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      "isRunning": false,
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0
    ]
    XCTAssertNil(WatchPatient.fromDictionary(dict))
  }

  // isRunning 欠落 → nil
  func testMissingIsRunning_returnsNil() {
    let dict: [String: Any] = [
      "id": "abc",
      "roomNumber": "101",
      "bedNumber": "1",
      "infusionSetType": "adult",
      "dropsPerMl": NSNumber(value: 20),
      "volume": 500.0,
      "totalMinutes": 60.0,
      // "isRunning" は省略
      "dropsPerMinute": 10.0,
      "dropInterval": 6000.0
    ]
    XCTAssertNil(WatchPatient.fromDictionary(dict))
  }
}

// MARK: - PatientStatusTests

final class PatientStatusTests: XCTestCase {
  // .label の4ケース
  func testLabel_waiting() { XCTAssertEqual(PatientStatus.waiting.label, "待機中") }
  func testLabel_running() { XCTAssertEqual(PatientStatus.running.label, "実行中") }
  func testLabel_endingSoon() { XCTAssertEqual(PatientStatus.endingSoon.label, "終了間近") }
  func testLabel_completed() { XCTAssertEqual(PatientStatus.completed.label, "完了") }

  // .color の4ケース
  func testColor_waiting() { XCTAssertEqual(PatientStatus.waiting.color, "gray") }
  func testColor_running() { XCTAssertEqual(PatientStatus.running.color, "green") }
  func testColor_endingSoon() { XCTAssertEqual(PatientStatus.endingSoon.color, "orange") }
  func testColor_completed() { XCTAssertEqual(PatientStatus.completed.color, "blue") }

  // .endingSoon の rawValue が "ending_soon"
  func testEndingSoon_rawValue() {
    XCTAssertEqual(PatientStatus.endingSoon.rawValue, "ending_soon")
  }
}

// MARK: - InfusionSetTypeTests

final class InfusionSetTypeTests: XCTestCase {
  // .adult.displayName → "成人用"
  func testAdult_displayName() {
    XCTAssertEqual(WatchPatient.InfusionSetType.adult.displayName, "成人用")
  }

  // .pediatric.displayName → "小児用"
  func testPediatric_displayName() {
    XCTAssertEqual(WatchPatient.InfusionSetType.pediatric.displayName, "小児用")
  }

  // rawValue から初期化: "adult" → .adult
  func testInit_fromValidRawValue() {
    XCTAssertEqual(WatchPatient.InfusionSetType(rawValue: "adult"), .adult)
  }

  // rawValue から初期化: 無効文字列 → nil
  func testInit_fromInvalidRawValue() {
    XCTAssertNil(WatchPatient.InfusionSetType(rawValue: "unknown"))
  }
}

// MARK: - WatchPatientStatusBoundaryTests

final class WatchPatientStatusBoundaryTests: XCTestCase {
  private func makePatient(isRunning: Bool, endTime: Date?) -> WatchPatient {
    WatchPatient(
      id: "test", roomNumber: "101", bedNumber: "1",
      infusionSetType: .adult, dropsPerMl: 20,
      volume: 500, totalMinutes: 60,
      isRunning: isRunning, startedAt: isRunning ? Date() : nil,
      endTime: endTime, dropsPerMinute: 10, dropInterval: 6000,
      hapticEnabled: false
    )
  }

  // remaining がちょうど5分（300秒）→ .endingSoon（境界値: remaining <= 300）
  func testExactly300Seconds_isEndingSoon() {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(300))
    XCTAssertEqual(p.status, .endingSoon)
  }

  // remaining が300.1秒 → .running（境界値: remaining > 300）
  func testJustOver300Seconds_isRunning() {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(301))
    XCTAssertEqual(p.status, .running)
  }
}

// MARK: - WatchPatientStatusTests（既存）

final class WatchPatientStatusTests: XCTestCase {
  /// テスト用のヘルパー: 指定パラメータでWatchPatientを生成
  private func makePatient(isRunning: Bool, endTime: Date?) -> WatchPatient {
    WatchPatient(
      id: "test", roomNumber: "101", bedNumber: "1",
      infusionSetType: .adult, dropsPerMl: 20,
      volume: 500, totalMinutes: 60,
      isRunning: isRunning, startedAt: isRunning ? Date() : nil,
      endTime: endTime, dropsPerMinute: 10, dropInterval: 6000,
      hapticEnabled: false
    )
  }

  // 自動完了: isRunning=false, endTime が過去 → .completed
  func testAutoCompleted() {
    let p = makePatient(isRunning: false, endTime: Date().addingTimeInterval(-10))
    XCTAssertEqual(p.status, .completed)
  }

  // 手動停止: isRunning=false, endTime=nil → .waiting
  func testManualStop() {
    let p = makePatient(isRunning: false, endTime: nil)
    XCTAssertEqual(p.status, .waiting)
  }

  // isRunning=false, endTime が未来 → .waiting（中間状態）
  func testNotRunningFutureEndTime() {
    let p = makePatient(isRunning: false, endTime: Date().addingTimeInterval(600))
    XCTAssertEqual(p.status, .waiting)
  }

  // isRunning=true, endTime が過去 → .completed
  func testRunningPastEndTime() {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(-0.1))
    XCTAssertEqual(p.status, .completed)
  }

  // isRunning=true, 残り5分以内 → .endingSoon
  func testEndingSoon() {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(4 * 60))
    XCTAssertEqual(p.status, .endingSoon)
  }

  // isRunning=true, 残り5分超 → .running
  func testRunning() {
    let p = makePatient(isRunning: true, endTime: Date().addingTimeInterval(10 * 60))
    XCTAssertEqual(p.status, .running)
  }

  // isRunning=true, endTime=nil → .waiting
  func testRunningNoEndTime() {
    let p = makePatient(isRunning: true, endTime: nil)
    XCTAssertEqual(p.status, .waiting)
  }
}
