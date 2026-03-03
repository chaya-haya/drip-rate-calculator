import XCTest
@testable import DripWatch

// MARK: - InfusionCalculatorDropsPerMinuteTests

final class InfusionCalculatorDropsPerMinuteTests: XCTestCase {
  // (500, 60, 20) → 166.666...（精度 accuracy: 0.01）
  func testNormalInput_returnsCorrectValue() {
    let result = InfusionCalculator.dropsPerMinute(volumeMl: 500, timeMinutes: 60, dropsPerMl: 20)
    XCTAssertEqual(result, 166.666, accuracy: 0.01)
  }

  // timeMinutes = 0 → 0
  func testZeroTimeMinutes_returnsZero() {
    let result = InfusionCalculator.dropsPerMinute(volumeMl: 500, timeMinutes: 0, dropsPerMl: 20)
    XCTAssertEqual(result, 0)
  }

  // volumeMl = 0 → 0
  func testZeroVolume_returnsZero() {
    let result = InfusionCalculator.dropsPerMinute(volumeMl: 0, timeMinutes: 60, dropsPerMl: 20)
    XCTAssertEqual(result, 0)
  }

  // dropsPerMl = 0 → 0
  func testZeroDropsPerMl_returnsZero() {
    let result = InfusionCalculator.dropsPerMinute(volumeMl: 500, timeMinutes: 60, dropsPerMl: 0)
    XCTAssertEqual(result, 0)
  }

  // 負数入力 → 0
  func testNegativeInput_returnsZero() {
    let result = InfusionCalculator.dropsPerMinute(volumeMl: -100, timeMinutes: 60, dropsPerMl: 20)
    XCTAssertEqual(result, 0)
  }
}

// MARK: - InfusionCalculatorHoursToMinutesTests

final class InfusionCalculatorHoursToMinutesTests: XCTestCase {
  // (1, 30) → 90
  func testOneHourThirtyMinutes() {
    XCTAssertEqual(InfusionCalculator.hoursToMinutes(hours: 1, minutes: 30), 90)
  }

  // (0, 30) → 30
  func testZeroHoursThirtyMinutes() {
    XCTAssertEqual(InfusionCalculator.hoursToMinutes(hours: 0, minutes: 30), 30)
  }

  // (1, 0) → 60
  func testOneHourZeroMinutes() {
    XCTAssertEqual(InfusionCalculator.hoursToMinutes(hours: 1, minutes: 0), 60)
  }

  // (0, 0) → 0
  func testZeroHoursZeroMinutes() {
    XCTAssertEqual(InfusionCalculator.hoursToMinutes(hours: 0, minutes: 0), 0)
  }

  // minutes 省略 (2) → 120
  func testDefaultMinutes_returnsHoursOnly() {
    XCTAssertEqual(InfusionCalculator.hoursToMinutes(hours: 2), 120)
  }
}

// MARK: - InfusionCalculatorDropIntervalTests

final class InfusionCalculatorDropIntervalTests: XCTestCase {
  // dropsPerMinute = 60 → 1000.0
  func test60DropsPerMinute_returns1000ms() {
    XCTAssertEqual(InfusionCalculator.dropInterval(dropsPerMinute: 60), 1000.0, accuracy: 0.001)
  }

  // dropsPerMinute = 0 → 0
  func testZeroDropsPerMinute_returnsZero() {
    XCTAssertEqual(InfusionCalculator.dropInterval(dropsPerMinute: 0), 0)
  }

  // dropsPerMinute = 600 → 100.0
  func test600DropsPerMinute_returns100ms() {
    XCTAssertEqual(InfusionCalculator.dropInterval(dropsPerMinute: 600), 100.0, accuracy: 0.001)
  }

  // 負数 → 0
  func testNegativeDropsPerMinute_returnsZero() {
    XCTAssertEqual(InfusionCalculator.dropInterval(dropsPerMinute: -10), 0)
  }
}

// MARK: - InfusionCalculatorTotalDropsTests

final class InfusionCalculatorTotalDropsTests: XCTestCase {
  // (500, 20) → 10000
  func testNormalInput_returns10000() {
    XCTAssertEqual(InfusionCalculator.totalDrops(volumeMl: 500, dropsPerMl: 20), 10000)
  }

  // (0, 20) → 0
  func testZeroVolume_returnsZero() {
    XCTAssertEqual(InfusionCalculator.totalDrops(volumeMl: 0, dropsPerMl: 20), 0)
  }

  // (500, 0) → 0
  func testZeroDropsPerMl_returnsZero() {
    XCTAssertEqual(InfusionCalculator.totalDrops(volumeMl: 500, dropsPerMl: 0), 0)
  }
}

// MARK: - InfusionCalculatorEndTimeTests

final class InfusionCalculatorEndTimeTests: XCTestCase {
  // totalMinutes = 60 → 現在から約3600秒後（誤差1秒以内）
  func test60Minutes_returnsApprox3600SecondsFromNow() {
    let before = Date()
    let result = InfusionCalculator.endTime(totalMinutes: 60)
    let after = Date()
    let lowerBound = before.addingTimeInterval(3600)
    let upperBound = after.addingTimeInterval(3601)
    XCTAssertTrue(result >= lowerBound && result <= upperBound,
                  "endTime \(result) should be approximately 3600 seconds from now")
  }

  // totalMinutes = 0 → ほぼ現在時刻（誤差1秒以内）
  func testZeroMinutes_returnsApproxNow() {
    let before = Date()
    let result = InfusionCalculator.endTime(totalMinutes: 0)
    let after = Date().addingTimeInterval(1)
    XCTAssertTrue(result >= before && result <= after,
                  "endTime \(result) should be approximately the current time")
  }
}

// MARK: - InfusionCalculatorFormatTimeTests

final class InfusionCalculatorFormatTimeTests: XCTestCase {
  // 既知の時刻（14:30）を DateComponents から生成して "14:30" を確認
  func testFormatTime_returns14colon30() throws {
    var components = DateComponents()
    components.hour = 14
    components.minute = 30
    let date = try XCTUnwrap(Calendar.current.date(from: components))
    XCTAssertEqual(InfusionCalculator.formatTime(date), "14:30")
  }
}
