import ExpoModulesCore
import WatchConnectivity

public class WatchConnectivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WatchConnectivity")

    Events("onWatchMessage")

    OnCreate {
      #if DEBUG
      print("[ExpoWC] Module created, activating WCSession...")
      #endif
      WatchSessionManager.shared.module = self
      WatchSessionManager.shared.activate()
    }

    Function("isSupported") {
      let supported = WCSession.isSupported()
      #if DEBUG
      print("[ExpoWC] isSupported: \(supported)")
      #endif
      return supported
    }

    AsyncFunction("isPaired") { (promise: Promise) in
      guard WCSession.isSupported() else {
        promise.resolve(false)
        return
      }
      promise.resolve(WCSession.default.isPaired)
    }

    AsyncFunction("isWatchAppInstalled") { (promise: Promise) in
      guard WCSession.isSupported() else {
        promise.resolve(false)
        return
      }
      promise.resolve(WCSession.default.isWatchAppInstalled)
    }

    AsyncFunction("isReachable") { (promise: Promise) in
      guard WCSession.isSupported() else {
        promise.resolve(false)
        return
      }
      promise.resolve(WCSession.default.isReachable)
    }

    AsyncFunction("sendMessage") { (message: [String: Any], promise: Promise) in
      guard WCSession.isSupported(), WCSession.default.isReachable else {
        promise.reject("NOT_REACHABLE", "Watch is not reachable")
        return
      }
      WCSession.default.sendMessage(message, replyHandler: { reply in
        promise.resolve(reply)
      }, errorHandler: { error in
        promise.reject("SEND_FAILED", error.localizedDescription)
      })
    }

    AsyncFunction("updateApplicationContext") { (context: [String: Any], promise: Promise) in
      guard WCSession.isSupported() else {
        promise.reject("NOT_SUPPORTED", "WatchConnectivity is not supported")
        return
      }
      do {
        try WCSession.default.updateApplicationContext(context)
        promise.resolve(nil)
      } catch {
        // applicationContext失敗時（Watchアプリ未検出等）はtransferUserInfoにフォールバック
        #if DEBUG
        print("[ExpoWC] updateApplicationContext failed: \(error.localizedDescription), falling back to transferUserInfo")
        #endif
        WCSession.default.transferUserInfo(context)
        promise.resolve(nil)
      }
    }

    AsyncFunction("transferUserInfo") { (userInfo: [String: Any], promise: Promise) in
      guard WCSession.isSupported() else {
        promise.reject("NOT_SUPPORTED", "WatchConnectivity is not supported")
        return
      }
      WCSession.default.transferUserInfo(userInfo)
      promise.resolve(nil)
    }
  }

  // WatchからのメッセージをJS層にイベント送信
  func emitWatchMessage(_ message: [String: Any]) {
    sendEvent("onWatchMessage", message)
  }
}
