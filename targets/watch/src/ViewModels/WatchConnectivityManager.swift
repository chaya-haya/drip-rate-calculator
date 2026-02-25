import Foundation
import WatchConnectivity

/// Watch側のWCSessionマネージャー
/// iPhoneから患者データを受信し、コマンドを送信する
class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchConnectivityManager()

  @Published var isReachable = false

  /// iPhoneから患者データ到着時のコールバック
  var onPatientsReceived: (([WatchPatient]) -> Void)?

  private override init() {
    super.init()
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = self
    session.activate()
  }

  // MARK: - iPhoneへのコマンド送信

  /// 投与開始コマンド送信
  /// Watch側で計算したendTimeをiPhoneに渡すことで、通信遅延による時刻ズレを防ぐ
  func sendStartCommand(patientId: String, endTime: Date) {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]  // 小数秒を含めてiPhoneとの時刻ズレを防ぐ
    let message: [String: Any] = [
      "type": "startInfusion",
      "patientId": patientId,
      "timestamp": Date().timeIntervalSince1970,
      "endTime": formatter.string(from: endTime),
    ]
    sendCommandMessage(message)
  }

  /// 投与停止コマンド送信
  func sendStopCommand(patientId: String) {
    let message: [String: Any] = [
      "type": "stopInfusion",
      "patientId": patientId,
      "timestamp": Date().timeIntervalSince1970,
    ]
    sendCommandMessage(message)
  }

  /// iPhoneに全同期をリクエスト
  func requestSync() {
    let message: [String: Any] = [
      "type": "requestSync",
      "patientId": "",
      "timestamp": Date().timeIntervalSince1970,
    ]
    sendCommandMessage(message)
  }

  private func sendCommandMessage(_ message: [String: Any]) {
    let session = WCSession.default
    if session.isReachable {
      session.sendMessage(message, replyHandler: nil) { [weak self] error in
        // 到達不能時はtransferUserInfoにフォールバック
        self?.fallbackTransferUserInfo(message)
      }
    } else {
      // iPhone到達不能、キュー配信を使用
      fallbackTransferUserInfo(message)
    }
  }

  private func fallbackTransferUserInfo(_ info: [String: Any]) {
    WCSession.default.transferUserInfo(info)
  }

  // MARK: - WCSessionDelegate

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    DispatchQueue.main.async {
      self.isReachable = session.isReachable
    }
    if activationState == .activated {
      // キャッシュされたアプリケーションコンテキストを読み込み
      processApplicationContext(session.receivedApplicationContext)
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async {
      self.isReachable = session.isReachable
    }
  }

  // アプリケーションコンテキスト受信（iPhoneからの患者データ同期）
  func session(
    _ session: WCSession,
    didReceiveApplicationContext applicationContext: [String: Any]
  ) {
    processApplicationContext(applicationContext)
  }

  // iPhoneからのダイレクトメッセージ受信
  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any]
  ) {
    processApplicationContext(message)
  }

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    processApplicationContext(message)
    replyHandler(["status": "received"])
  }

  // MARK: - 受信データの処理

  private func processApplicationContext(_ context: [String: Any]) {
    guard let patientsArray = context["patients"] as? [[String: Any]] else {
      return
    }
    let patients = patientsArray.compactMap { WatchPatient.fromDictionary($0) }

    DispatchQueue.main.async { [weak self] in
      self?.onPatientsReceived?(patients)
    }
  }
}
