import {
  IconCircleMinus,
  IconEdit,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useState } from "react";
import type { TableInfo } from "../../api/kasane/types";
import { useKasaneStore } from "../../stores/kasaneStore";
import IconButton from "../feature-manager/common-ui/IconButton";
import styles from "./TableListPanel.module.scss";
import ValueColorPanel from "./ValueColorPanel";

/** 値ごとの色編集に対応しているデータ型（boolean/string） */
function isValueColorEditable(table: TableInfo): boolean {
  return table.data_type === "Boolean" || table.data_type === "Text";
}

/**
 * ビューワーモードの左下「テーブル一覧」パネル。
 * テーブルパネルから追加されたテーブルを一覧表示し、地図に描画する。
 * 鉛筆=値ごとの色編集 / 目=表示切替 / ⊖=一覧から削除
 */
export default function TableListPanel() {
  const selectedDb = useKasaneStore((s) => s.selectedDb);
  const selectedTables = useKasaneStore((s) => s.selectedTables);
  const layerVisibility = useKasaneStore((s) => s.layerVisibility);
  const toggleTable = useKasaneStore((s) => s.toggleTable);
  const toggleLayerVisibility = useKasaneStore((s) => s.toggleLayerVisibility);

  const [editingTableName, setEditingTableName] = useState<string | null>(null);

  const editingTable =
    selectedTables.find((t) => t.name === editingTableName) ?? null;

  return (
    <>
      <div className={styles.panel}>
        <h2 className={styles.heading}>テーブル一覧</h2>
        <div className={styles.list}>
          {selectedTables.length === 0 ? (
            <div className={styles.message}>
              テーブルの＋ボタンで追加してください
            </div>
          ) : (
            selectedTables.map((table) => {
              const visible = layerVisibility[table.name] ?? true;
              const isEditing = editingTableName === table.name;
              return (
                <div
                  key={table.name}
                  className={`${styles.item} ${isEditing ? styles.itemEditing : ""}`}
                >
                  <div className={styles.itemText}>
                    {selectedDb ?? ""} / {table.name} (z= {table.max_zoom_level}
                    )
                  </div>
                  <div className={styles.actions}>
                    <IconButton
                      onClick={() =>
                        setEditingTableName(isEditing ? null : table.name)
                      }
                      ariaLabel={`${table.name}の値ごとの色を編集`}
                      disabled={!isValueColorEditable(table)}
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      onClick={() => toggleLayerVisibility(table.name)}
                      ariaLabel={`${table.name}の表示を切り替え`}
                    >
                      {visible ? <IconEye /> : <IconEyeOff />}
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        toggleTable(table, false);
                        if (isEditing) setEditingTableName(null);
                      }}
                      ariaLabel={`${table.name}をテーブル一覧から削除`}
                      variant="danger"
                    >
                      <IconCircleMinus />
                    </IconButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {editingTable && <ValueColorPanel table={editingTable} />}
    </>
  );
}
