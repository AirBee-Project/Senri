import { IconCirclePlus } from "@tabler/icons-react";
import { useEffect } from "react";
import { listDatabases, listTables } from "../../api/kasane/api";
import {
  isKasaneConfigured,
  KASANE_DEFAULT_DATABASE,
} from "../../api/kasane/config";
import type { DatabaseInfo, TableInfo } from "../../api/kasane/types";
import { useKasaneStore } from "../../stores/kasaneStore";
import IconButton from "../feature-manager/common-ui/IconButton";
import styles from "./TablePanel.module.scss";

/** 指定DB（未指定なら先頭のDB）のテーブル一覧を取得する */
async function fetchDefaultDbTables(): Promise<{
  databases: DatabaseInfo[];
  db: string;
  tables: TableInfo[];
}> {
  const databases = await listDatabases();
  const db = KASANE_DEFAULT_DATABASE || (databases[0]?.name ?? "");
  if (!db) {
    throw new Error("データベースが見つかりません");
  }
  const tables = await listTables(db);
  return { databases, db, tables };
}

/**
 * ビューワーモードの左上パネル。
 * コード側で指定したデータベース（KASANE_DEFAULT_DATABASE）の全テーブルを一覧表示し、
 * ＋ボタンで下のテーブル一覧パネルへ追加する。
 */
export default function TablePanel() {
  const tables = useKasaneStore((s) => s.tables);
  const selectedDb = useKasaneStore((s) => s.selectedDb);
  const selectedTables = useKasaneStore((s) => s.selectedTables);
  const error = useKasaneStore((s) => s.error);
  const setDatabases = useKasaneStore((s) => s.setDatabases);
  const setTables = useKasaneStore((s) => s.setTables);
  const selectDb = useKasaneStore((s) => s.selectDb);
  const toggleTable = useKasaneStore((s) => s.toggleTable);
  const setError = useKasaneStore((s) => s.setError);

  const configured = isKasaneConfigured();

  // 初回: 表示対象DBのテーブル一覧を取得
  useEffect(() => {
    if (!configured) return;
    let aborted = false;
    fetchDefaultDbTables()
      .then(({ databases, db, tables: tbls }) => {
        if (aborted) return;
        setDatabases(databases);
        selectDb(db);
        setTables(tbls);
      })
      .catch((e: unknown) => {
        if (!aborted) setError((e as Error).message);
      });
    return () => {
      aborted = true;
    };
  }, [configured, setDatabases, setTables, selectDb, setError]);

  // テーブル一覧へ追加済みのテーブルは外す（⊖で削除するとここへ戻る）
  const availableTables = tables.filter(
    (table) => !selectedTables.some((t) => t.name === table.name),
  );

  const body = !configured ? (
    <div className={styles.message}>
      Kasane の接続情報が未設定です。<code>.env</code> を設定してください。
    </div>
  ) : error ? (
    <div className={styles.error} role="alert">
      {error}
    </div>
  ) : tables.length === 0 ? (
    <div className={styles.message}>テーブルがありません</div>
  ) : availableTables.length === 0 ? (
    <div className={styles.message}>すべてのテーブルを追加済みです</div>
  ) : (
    availableTables.map((table) => (
      <div key={table.name} className={styles.item}>
        <div className={styles.itemText}>
          {selectedDb ?? ""} / {table.name} (z= {table.max_zoom_level})
        </div>
        <IconButton
          onClick={() => toggleTable(table, true)}
          ariaLabel={`${table.name}をテーブル一覧に追加`}
        >
          <IconCirclePlus />
        </IconButton>
      </div>
    ))
  );

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>テーブル</h2>
      <div className={styles.list}>{body}</div>
    </div>
  );
}
