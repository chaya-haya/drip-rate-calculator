// 医療リファレンスシナリオ（テスト用）
// 看護師向け標準計算表に基づく検証値

interface MedicalScenario {
  name: string;
  volume: number;
  timeMinutes: number;
  dropsPerMl: number;
  expectedDropsPerMin: number;
  expectedRounded: number;
}

interface MedicalScenarios {
  adult: MedicalScenario[];
  pediatric: MedicalScenario[];
}

export const MEDICAL_SCENARIOS: MedicalScenarios = {
  adult: [
    {
      name: "生理食塩水 1000mL/8時間",
      volume: 1000,
      timeMinutes: 480,
      dropsPerMl: 20,
      expectedDropsPerMin: 41.67,
      expectedRounded: 42,
    },
    {
      name: "5%ブドウ糖液 500mL/4時間",
      volume: 500,
      timeMinutes: 240,
      dropsPerMl: 20,
      expectedDropsPerMin: 41.67,
      expectedRounded: 42,
    },
    {
      name: "抗生剤 100mL/30分",
      volume: 100,
      timeMinutes: 30,
      dropsPerMl: 20,
      expectedDropsPerMin: 66.67,
      expectedRounded: 67,
    },
    {
      name: "輸血 250mL/2時間",
      volume: 250,
      timeMinutes: 120,
      dropsPerMl: 20,
      expectedDropsPerMin: 41.67,
      expectedRounded: 42,
    },
    {
      name: "TPN 2000mL/24時間",
      volume: 2000,
      timeMinutes: 1440,
      dropsPerMl: 20,
      expectedDropsPerMin: 27.78,
      expectedRounded: 28,
    },
  ],

  pediatric: [
    {
      name: "維持輸液 50mL/時",
      volume: 50,
      timeMinutes: 60,
      dropsPerMl: 60,
      expectedDropsPerMin: 50,
      expectedRounded: 50,
    },
    {
      name: "抗生剤 20mL/30分",
      volume: 20,
      timeMinutes: 30,
      dropsPerMl: 60,
      expectedDropsPerMin: 40,
      expectedRounded: 40,
    },
    {
      name: "少量輸液 100mL/4時間",
      volume: 100,
      timeMinutes: 240,
      dropsPerMl: 60,
      expectedDropsPerMin: 25,
      expectedRounded: 25,
    },
  ],
};
