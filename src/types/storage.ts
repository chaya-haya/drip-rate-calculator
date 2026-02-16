// ストレージ操作の結果型
export interface StorageResult<T> {
  success: boolean;
  data: T;
  error?: Error;
}

export interface StorageSaveResult {
  success: boolean;
  error?: Error;
}
