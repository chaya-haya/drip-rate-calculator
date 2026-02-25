import Foundation
import Combine

/// Watchアプリのメイン状態管理
class PatientsViewModel: ObservableObject {
  @Published var patients: [WatchPatient] = []
  @Published var isConnected = false

  private let connectivity = WatchConnectivityManager.shared
  private var timer: Timer?
  private var endingSoonNotified = Set<String>()
  private var completedNotified = Set<String>()

  init() {
    connectivity.onPatientsReceived = { [weak self] patients in
      self?.patients = patients
    }
    connectivity.activate()

    // 到達可能状態を監視
    connectivity.$isReachable
      .receive(on: DispatchQueue.main)
      .assign(to: &$isConnected)

    // カウントダウン用に毎秒ステータスを更新
    timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
      self?.refreshStatuses()
    }
  }

  deinit {
    timer?.invalidate()
  }

  /// IDで患者を取得
  func patient(for id: String) -> WatchPatient? {
    patients.first { $0.id == id }
  }

  /// iPhoneに開始コマンドを送信
  func startInfusion(patientId: String) {
    guard let index = patients.firstIndex(where: { $0.id == patientId }) else { return }
    let totalMinutes = patients[index].totalMinutes
    // Watch側でendTimeを計算してコマンドに乗せる（iPhone側の再計算による時刻ズレを防ぐ）
    let endTime = Date().addingTimeInterval(totalMinutes * 60)
    connectivity.sendStartCommand(patientId: patientId, endTime: endTime)
    // 楽観的ローカル更新
    patients[index].isRunning = true
    patients[index].startedAt = Date()
    patients[index].endTime = endTime
  }

  /// iPhoneに停止コマンドを送信
  func stopInfusion(patientId: String) {
    connectivity.sendStopCommand(patientId: patientId)
    // 楽観的ローカル更新
    if let index = patients.firstIndex(where: { $0.id == patientId }) {
      patients[index].isRunning = false
      patients[index].startedAt = nil
      patients[index].endTime = nil
    }
  }

  /// iPhoneに全同期をリクエスト
  func requestSync() {
    connectivity.requestSync()
  }

  /// ステータスをリフレッシュ（カウントダウンのUI更新をトリガー）
  private func refreshStatuses() {
    var updated = false
    for i in patients.indices {
      guard patients[i].isRunning, let endTime = patients[i].endTime else { continue }

      let remaining = endTime.timeIntervalSinceNow

      // 「終了間近」（5分前）でハプティック
      if remaining <= 5 * 60 && remaining > 0 && !endingSoonNotified.contains(patients[i].id) {
        endingSoonNotified.insert(patients[i].id)
        HapticManager.play(.endingSoon)
      }

      // 終了時に自動完了＋ハプティック
      if remaining <= 0 {
        patients[i].isRunning = false
        updated = true
        if !completedNotified.contains(patients[i].id) {
          completedNotified.insert(patients[i].id)
          HapticManager.play(.completed)
        }
      }
    }

    // 停止した患者の通知トラッキングをクリーンアップ
    let runningIds = Set(patients.filter { $0.isRunning }.map { $0.id })
    endingSoonNotified = endingSoonNotified.intersection(runningIds)

    if updated {
      objectWillChange.send()
    }
  }
}
