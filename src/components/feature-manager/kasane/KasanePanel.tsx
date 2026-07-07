import type React from "react";
import { useEffect } from "react";
import { listDatabases, listTables } from "../../../api/kasane/api";
import { isKasaneConfigured } from "../../../api/kasane/config";
import { useKasaneStore } from "../../../stores/kasaneStore";
import CommonPanel from "../common-ui/Panel";
import styles from "./KasanePanel.module.scss";

export default function KasanePanel() {
  const databases = useKasaneStore((s) => s.databases);
  const tables = useKasaneStore((s) => s.tables);
  const selectedDb = useKasaneStore((s) => s.selectedDb);
  const selectedTables = useKasaneStore((s) => s.selectedTables);
  const loading = useKasaneStore((s) => s.loading);
  const error = useKasaneStore((s) => s.error);
  const notice = useKasaneStore((s) => s.notice);
  const setDatabases = useKasaneStore((s) => s.setDatabases);
  const setTables = useKasaneStore((s) => s.setTables);
  const selectDb = useKasaneStore((s) => s.selectDb);
  const toggleTable = useKasaneStore((s) => s.toggleTable);
  const setError = useKasaneStore((s) => s.setError);

  const configured = isKasaneConfigured();

  // 初回: データベース一覧を取得
  useEffect(() => {
    if (!configured) return;
    let aborted = false;
    listDatabases()
      .then((dbs) => {
        if (!aborted) setDatabases(dbs);
      })
      .catch((e: unknown) => {
        if (!aborted) setError((e as Error).message);
      });
    return () => {
      aborted = true;
    };
  }, [configured, setDatabases, setError]);

  const handleDbChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const db = e.target.value || null;
    selectDb(db);
    if (!db) return;
    try {
      setTables(await listTables(db));
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <CommonPanel>
      {!configured ? (
        <div className={styles.message}>
          Kasane の接続情報が未設定です。<code>.env</code> を設定してください。
        </div>
      ) : (
        <div className={styles.body}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>データベース</span>
            <select
              className={styles.select}
              value={selectedDb ?? ""}
              onChange={handleDbChange}
            >
              <option value="">選択してください</option>
              {databases.map((db) => (
                <option key={db.name} value={db.name}>
                  {db.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>テーブル</span>
            {!selectedDb ? (
              <div className={styles.message}>先にDBを選択してください</div>
            ) : tables.length === 0 ? (
              <div className={styles.message}>テーブルがありません</div>
            ) : (
              <div className={styles.tableList}>
                {tables.map((t) => {
                  const isSelected = selectedTables.some(
                    (st) => st.name === t.name,
                  );
                  return (
                    <label key={t.name} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleTable(t, e.target.checked)}
                      />
                      {t.name}{" "}
                      <span className={styles.dataType}>（{t.data_type}）</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.statusContainer}>
            {loading && (
              <span className={styles.statusMessage}>読み込み中…</span>
            )}
            {!loading && notice && (
              <span className={styles.notice}>{notice}</span>
            )}
            {!loading && !notice && error && (
              <span className={styles.error} role="alert">
                {error}
              </span>
            )}
          </div>
        </div>
      )}
    </CommonPanel>
  );
}
