// 滴下数/分を計算
export const calculateDropsPerMinute = (
  volumeMl: number,
  timeMinutes: number,
  dropsPerMl: number
): number => {
  if (timeMinutes <= 0 || volumeMl <= 0 || dropsPerMl <= 0) {
    return 0;
  }
  return (volumeMl * dropsPerMl) / timeMinutes;
};

// 時間・分を合計分に変換
export const hoursToMinutes = (hours: number, minutes: number = 0): number => {
  return hours * 60 + minutes;
};

// 滴下間隔（ミリ秒）を計算
export const calculateDropInterval = (dropsPerMinute: number): number => {
  if (dropsPerMinute <= 0) {
    return 0;
  }
  return (60 * 1000) / dropsPerMinute;
};

// 総滴下数を計算
export const calculateTotalDrops = (volumeMl: number, dropsPerMl: number): number => {
  return volumeMl * dropsPerMl;
};

// 終了予定時刻を計算
export const calculateEndTime = (timeMinutes: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + timeMinutes * 60 * 1000);
};

// 時刻を HH:MM 形式にフォーマット
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
