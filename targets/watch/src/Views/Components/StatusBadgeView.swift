import SwiftUI

/// iPhoneアプリのStatusBadgeに対応するステータスバッジ
struct StatusBadgeView: View {
  let status: PatientStatus

  var body: some View {
    Text(status.label)
      .font(.system(size: 10, weight: .semibold))
      .padding(.horizontal, 6)
      .padding(.vertical, 2)
      .background(statusColor.opacity(0.2))
      .foregroundColor(statusColor)
      .clipShape(Capsule())
  }

  private var statusColor: Color {
    switch status {
    case .waiting: return .gray
    case .running: return .green
    case .endingSoon: return .orange
    case .completed: return .blue
    }
  }
}
