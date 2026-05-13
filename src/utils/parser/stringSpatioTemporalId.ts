import { err, ok, type Result } from "../../types/core/result";
import type { SpatioTemporalId } from "../../types/geometry/spatioTemporalId";

/**
 * パース関数のエラー型
 */
export type ParseStringSpatioTemporalIdError = {
  /** エラーとなった文字列 */
  content: string;
  /** エラーメッセージ */
  message: string;
};

/**
 * パース関数の結果型
 */
export type ParseStringSpatioTemporalIdResult = {
  /** パースに成功した時空間ID */
  success: SpatioTemporalId[];
  /** エラーの情報 */
  errors: ParseStringSpatioTemporalIdError[];
};

/**
 * 時空間IDの文字列表記から
 * {@link SpatioTemporalId SpatioTemporalId型}
 * へのパースを行う関数
 */
export function parseStringSpatioTemporalId(
  target: string,
): ParseStringSpatioTemporalIdResult {
  const result: ParseStringSpatioTemporalIdResult = {
    success: [],
    errors: [],
  };

  // カンマ区切りの分割設定
  const rawTokens = target
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawTokens.length === 0) {
    return result;
  }

  for (const token of rawTokens) {
    //時間ID部分があるかの判定
    const parts = token.split("_");
    if (parts.length > 2) {
      result.errors.push({
        content: token,
        message: "形式が不正です。アンダースコア(_)は1つのみ使用可能です。",
      });
    }

    // 時間IDと空間IDを分割
    const [spatialStr, _temporalStr] = parts;

    // まず、空間ID部分をパース
    const spatialElements = spatialStr.split("/");

    if (spatialElements.length !== 3) {
      result.errors.push({
        content: token,
        message:
          "空間IDの要素数が不正です。{z}/{f}/{x}/{y} の形式で指定してください。",
      });
    }

    const z_parse = parseIntRange(spatialElements[0], 0, 30);

    // ズームレベルの検証
    if (!z_parse.success) {
      z_parse.error;
    }
  }

  return result;
}

export function parseIntRange(
  value: string,
  min: number,
  max: number,
): Result<number, string> {
  // 空文字チェック
  if (value.trim() === "") {
    return err("値が空です");
  }

  // 数値変換
  const num = Number(value);

  // 数値変換できるか
  if (Number.isNaN(num)) {
    return err("数値に変換できません");
  }

  // 整数チェック
  if (!Number.isInteger(num)) {
    return err("整数を入力してください");
  }

  // 範囲チェック
  if (num < min || num > max) {
    return err(`${min}〜${max}の範囲で入力してください`);
  }

  return ok(num);
}
