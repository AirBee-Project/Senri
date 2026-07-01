import Dexie, { type Table } from "dexie";
import type { KasaneWorkerOutput } from "../../workers/kasaneWorkerProtocol";

export type CachedTilePayload = KasaneWorkerOutput["payload"];

export interface KasaneTileCacheRecord {
  id: string; // db名-テーブル名-z-x-y
  payload: CachedTilePayload;
  lastAccessed: number;
}

export class KasaneCacheDB extends Dexie {
  tiles!: Table<KasaneTileCacheRecord, string>;

  constructor() {
    super("KasaneCacheDB");
    this.version(1).stores({
      tiles: "id, lastAccessed",
    });
  }
}

export const kasaneCacheDb = new KasaneCacheDB();

// 最大キャッシュ数（タイル数）
const MAX_CACHE_SIZE = 2000;

/**
 * キャッシュからタイルデータを取得する
 * 取得に成功した場合、lastAccessed を現在時刻に更新する（LRU対策）
 */
export async function getCachedTile(
  id: string,
): Promise<CachedTilePayload | null> {
  try {
    const record = await kasaneCacheDb.tiles.get(id);
    if (record) {
      // 非同期でアクセス日時を更新
      kasaneCacheDb.tiles
        .update(id, { lastAccessed: Date.now() })
        .catch(console.error);
      return record.payload;
    }
  } catch (error) {
    console.warn("キャッシュからのタイルデータ取得に失敗しました", error);
  }
  return null;
}

/**
 * タイルデータをキャッシュに保存し、上限を超えていれば古いものを削除する
 */
export async function saveTileToCache(
  id: string,
  payload: CachedTilePayload,
): Promise<void> {
  try {
    await kasaneCacheDb.tiles.put({ id, payload, lastAccessed: Date.now() });

    // LRUロジック
    const count = await kasaneCacheDb.tiles.count();
    if (count > MAX_CACHE_SIZE) {
      const excess = count - MAX_CACHE_SIZE;
      // 古いものから順に取得して削除
      const oldest = await kasaneCacheDb.tiles
        .orderBy("lastAccessed")
        .limit(excess)
        .toArray();
      const oldestIds = oldest.map((r) => r.id);
      await kasaneCacheDb.tiles.bulkDelete(oldestIds);
    }
  } catch (error) {
    console.warn("キャッシュへのタイルデータ保存に失敗しました", error);
  }
}
