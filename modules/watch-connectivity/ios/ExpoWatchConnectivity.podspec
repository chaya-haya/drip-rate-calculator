Pod::Spec.new do |s|
  s.name           = 'ExpoWatchConnectivity'
  s.version        = '1.0.0'
  s.summary        = 'WatchConnectivity bridge for React Native'
  s.description    = 'Expo module bridging WatchConnectivity framework to React Native'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platform       = :ios, '15.1'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.frameworks = 'WatchConnectivity'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
