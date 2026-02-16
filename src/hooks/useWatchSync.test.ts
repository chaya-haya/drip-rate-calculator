import type { WatchPatientData } from '../../modules/watch-connectivity/src/WatchConnectivityModule.types';

describe('WatchPatientData type contract', () => {
  const baseData: Omit<WatchPatientData, 'hapticEnabled'> = {
    id: 'patient-1',
    roomNumber: '101',
    bedNumber: 'A',
    infusionSetType: 'adult',
    dropsPerMl: 20,
    volume: 500,
    totalMinutes: 120,
    isRunning: true,
    startedAt: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T12:00:00Z',
    dropsPerMinute: 83.33,
    dropInterval: 720,
  };

  test('hapticEnabled: true のオブジェクトが型を満たす', () => {
    const data: WatchPatientData = { ...baseData, hapticEnabled: true };

    expect(data.hapticEnabled).toBe(true);
  });

  test('hapticEnabled: false のオブジェクトが型を満たす', () => {
    const data: WatchPatientData = { ...baseData, hapticEnabled: false };

    expect(data.hapticEnabled).toBe(false);
  });
});
