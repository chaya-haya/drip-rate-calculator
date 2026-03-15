import Foundation
import WatchConnectivity

/// iPhone側のWCSessionを管理するシングルトン
class WatchSessionManager: NSObject, WCSessionDelegate {
  static let shared = WatchSessionManager()

  weak var module: WatchConnectivityModule?

  private override init() {
    super.init()
  }

  func activate() {
    guard WCSession.isSupported() else {
      #if DEBUG
      print("[ExpoWC] WCSession not supported on this device")
      #endif
      return
    }
    let session = WCSession.default
    session.delegate = self
    session.activate()
  }

  // MARK: - WCSessionDelegate 必須メソッド

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    if let error = error {
      #if DEBUG
      print("[ExpoWC] Activation FAILED: \(error.localizedDescription)")
      #endif
    }
  }

  func sessionDidBecomeInactive(_ session: WCSession) {
    // セッション非アクティブ化
  }

  func sessionDidDeactivate(_ session: WCSession) {
    // Watch切り替え時に再アクティベーション
    WCSession.default.activate()
  }

  // MARK: - Watchからのメッセージ受信

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any]
  ) {
    DispatchQueue.main.async { [weak self] in
      self?.module?.emitWatchMessage(message)
    }
  }

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      self?.module?.emitWatchMessage(message)
    }
    replyHandler(["status": "received"])
  }

  // MARK: - ユーザー情報受信（キュー配信）

  func session(
    _ session: WCSession,
    didReceiveUserInfo userInfo: [String: Any]
  ) {
    DispatchQueue.main.async { [weak self] in
      self?.module?.emitWatchMessage(userInfo)
    }
  }
}
