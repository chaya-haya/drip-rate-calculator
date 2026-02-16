import SwiftUI

/// 患者詳細画面（開始/停止・点滴アニメーション付き）
struct PatientDetailView: View {
  let patientId: String
  @EnvironmentObject var viewModel: PatientsViewModel

  private var patient: WatchPatient? {
    viewModel.patient(for: patientId)
  }

  var body: some View {
    ScrollView {
      if let patient = patient {
        VStack(spacing: 12) {
          // 患者情報ヘッダー
          patientHeader(patient)

          // 点滴アニメーション
          if patient.dropInterval > 0 {
            DripAnimationView(
              dropInterval: patient.dropInterval,
              isActive: true,
              hapticEnabled: patient.isRunning && patient.hapticEnabled
            )
            .frame(height: 44)
          }

          if patient.isRunning {
            CountdownView(patient: patient)
          } else {
            infusionSummary(patient)
          }

          // 開始/停止ボタン
          actionButton(patient)
        }
        .padding(.horizontal)
      } else {
        Text("患者が見つかりません")
          .foregroundColor(.secondary)
      }
    }
    .navigationTitle(patient?.displayName ?? "詳細")
  }

  @ViewBuilder
  private func patientHeader(_ patient: WatchPatient) -> some View {
    HStack {
      VStack(alignment: .leading, spacing: 2) {
        Text(patient.displayName)
          .font(.system(.headline, design: .rounded))
        Text(patient.infusionSetType.displayName)
          .font(.caption2)
          .foregroundColor(.secondary)
      }
      Spacer()
      StatusBadgeView(status: patient.status)
    }
  }

  @ViewBuilder
  private func infusionSummary(_ patient: WatchPatient) -> some View {
    VStack(spacing: 6) {
      HStack {
        Label("\(Int(patient.volume))mL", systemImage: "drop.fill")
          .font(.caption)
        Spacer()
        Label("\(Int(patient.totalMinutes))分", systemImage: "clock")
          .font(.caption)
      }
      .foregroundColor(.secondary)

      HStack {
        Text(String(format: "%.1f", patient.dropsPerMinute))
          .font(.system(.title2, design: .rounded))
          .fontWeight(.bold)
          .foregroundColor(.blue)
        Text("滴/分")
          .font(.caption)
          .foregroundColor(.secondary)
      }
    }
    .padding(.vertical, 4)
  }

  @ViewBuilder
  private func actionButton(_ patient: WatchPatient) -> some View {
    if patient.isRunning {
      Button(role: .destructive) {
        viewModel.stopInfusion(patientId: patient.id)
        HapticManager.play(.stop)
      } label: {
        Label("停止", systemImage: "stop.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.borderedProminent)
      .tint(.red)
    } else {
      Button {
        viewModel.startInfusion(patientId: patient.id)
        HapticManager.play(.start)
      } label: {
        Label("開始", systemImage: "play.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.borderedProminent)
      .tint(.green)
      .disabled(patient.volume <= 0 || patient.totalMinutes <= 0)
    }
  }
}
