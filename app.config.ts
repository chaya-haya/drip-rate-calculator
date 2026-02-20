import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  // prebuild / EAS Build 時のみ Apple Targets プラグインを読み込む
  const isPrebuild =
    process.env.EAS_BUILD === "true" ||
    process.argv.some((arg) => arg.includes("prebuild")) ||
    process.env.APPLE_TARGETS === "true";

  const plugins: ExpoConfig["plugins"] = [["expo-notifications", { sounds: [] }], "expo-router"];

  if (isPrebuild) {
    plugins.push("@bacons/apple-targets");
  }

  return {
    ...config,
    name: "点滴滴下数計算",
    slug: "drip-rate-calculator",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "drip-rate-calculator",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.dripcalculator.app",
      buildNumber: "1",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
      },
    },
    android: {
      package: "com.dripcalculator.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins,
    extra: {
      eas: {
        projectId: "c638c6d0-5e4c-4be9-ae0f-404e05aee7d5",
      },
      router: {
        origin: false,
      },
    },
    owner: "kaya_kaya",
  };
};
