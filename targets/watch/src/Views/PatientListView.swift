import SwiftUI

/// Watchの患者一覧画面
struct PatientListView: View {
  @EnvironmentObject var viewModel: PatientsViewModel

  var body: some View {
    NavigationStack {
      Group {
        if viewModel.patients.isEmpty {
          VStack(spacing: 8) {
            Image(systemName: "iphone.and.arrow.forward")
              .font(.system(size: 28))
              .foregroundColor(.secondary)
            Text("iPhoneで患者を\n追加してください")
              .font(.caption)
              .foregroundColor(.secondary)
              .multilineTextAlignment(.center)
          }
          .padding()
        } else {
          List {
            ForEach(viewModel.patients) { patient in
              NavigationLink(destination: PatientDetailView(patientId: patient.id)) {
                PatientRow(patient: patient)
              }
            }
          }
        }
      }
      .navigationTitle("患者一覧")
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            viewModel.requestSync()
          } label: {
            Image(systemName: "arrow.triangle.2.circlepath")
              .font(.caption2)
          }
        }
        ToolbarItem(placement: .bottomBar) {
          NavigationLink(destination: NumericMemoView()) {
            Label("メモ", systemImage: "square.and.pencil")
              .font(.caption2)
          }
        }
      }
    }
  }
}

/// 患者一覧の行ビュー
struct PatientRow: View {
  let patient: WatchPatient

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      HStack {
        Text(patient.displayName)
          .font(.system(.body, design: .rounded))
          .fontWeight(.medium)
        Spacer()
        StatusBadgeView(status: patient.status)
      }

      if patient.isRunning, let endTime = patient.endTime, endTime > Date() {
        HStack(spacing: 4) {
          Image(systemName: "timer")
            .font(.caption2)
            .foregroundColor(.secondary)
          Text(timerInterval: Date()...endTime, countsDown: true)
            .font(.system(.caption, design: .monospaced))
            .foregroundColor(patient.status == .endingSoon ? .orange : .secondary)
        }
      } else {
        Text("\(Int(patient.volume))mL / \(Int(patient.totalMinutes))分")
          .font(.caption)
          .foregroundColor(.secondary)
      }
    }
    .padding(.vertical, 2)
  }
}
