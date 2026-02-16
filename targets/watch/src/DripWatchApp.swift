import SwiftUI

@main
struct DripWatchApp: App {
  @StateObject private var patientsViewModel = PatientsViewModel()

  var body: some Scene {
    WindowGroup {
      PatientListView()
        .environmentObject(patientsViewModel)
    }
  }
}
