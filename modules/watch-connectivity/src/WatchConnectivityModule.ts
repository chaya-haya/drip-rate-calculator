import { requireOptionalNativeModule, type EventSubscription } from "expo-modules-core";
import type { WatchMessage } from "./WatchConnectivityModule.types";

// モジュールが発行するイベント
type WatchConnectivityEvents = {
  onWatchMessage: (message: WatchMessage) => void;
};

// ネイティブモジュールのインターフェース
interface WatchConnectivityNativeModule {
  isSupported(): boolean;
  isPaired(): Promise<boolean>;
  isWatchAppInstalled(): Promise<boolean>;
  isReachable(): Promise<boolean>;
  sendMessage(message: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateApplicationContext(context: Record<string, unknown>): Promise<void>;
  transferUserInfo(userInfo: Record<string, unknown>): Promise<void>;
  addListener<K extends keyof WatchConnectivityEvents>(
    eventName: K,
    listener: WatchConnectivityEvents[K]
  ): EventSubscription;
  removeListener<K extends keyof WatchConnectivityEvents>(
    eventName: K,
    listener: WatchConnectivityEvents[K]
  ): void;
}

// Expo Goではネイティブモジュールが利用不可のためoptionalで読み込む
const nativeModule =
  requireOptionalNativeModule<WatchConnectivityNativeModule>("WatchConnectivity");

// コールバック参照でリスナーを管理
const listeners = new Map<(message: WatchMessage) => void, EventSubscription>();

// Watchとの接続状態を確認（到達可能か）
export async function isWatchConnected(): Promise<boolean> {
  try {
    return (await nativeModule?.isReachable()) ?? false;
  } catch {
    return false;
  }
}

// Apple Watchがペアリング済みか確認
export async function isPaired(): Promise<boolean> {
  try {
    return (await nativeModule?.isPaired()) ?? false;
  } catch {
    return false;
  }
}

// コンパニオンWatchアプリがインストール済みか確認
export async function isWatchAppInstalled(): Promise<boolean> {
  try {
    return (await nativeModule?.isWatchAppInstalled()) ?? false;
  } catch {
    return false;
  }
}

// Watchにメッセージを送信（Watchが到達可能であることが必要）
export async function sendMessage(
  message: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!nativeModule) return {};
  return nativeModule.sendMessage(message);
}

// アプリケーションコンテキストを更新（Watchアプリ起動時に配信される主要同期手段）
export async function updateApplicationContext(context: Record<string, unknown>): Promise<void> {
  if (!nativeModule) return;
  return nativeModule.updateApplicationContext(context);
}

// ユーザー情報を転送（キュー配信、配信保証あり。到達不能時のフォールバック）
export async function transferUserInfo(userInfo: Record<string, unknown>): Promise<void> {
  if (!nativeModule) return;
  return nativeModule.transferUserInfo(userInfo);
}

// Watchからのメッセージリスナーを追加
export function addMessageListener(callback: (message: WatchMessage) => void): void {
  if (!nativeModule) return;
  const subscription = nativeModule.addListener("onWatchMessage", callback);
  listeners.set(callback, subscription);
}

// メッセージリスナーを削除
export function removeMessageListener(callback: (message: WatchMessage) => void): void {
  const subscription = listeners.get(callback);
  if (subscription) {
    subscription.remove();
    listeners.delete(callback);
  }
}
