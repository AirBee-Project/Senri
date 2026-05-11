import { z } from "zod";
import { RGBAColorSchema } from "./color";

/**
 * 座標成分のスキーマ
 */
export const IdIndexSchema = z.union([
  z.number().int().positive("正の数で指定してください"),
  z
    .string()
    .regex(
      /^(-?\d+|-)(:(-?\d+|-))?$/,
      "数値、または '開始:終了'、'開始:-'、'-:終了' の形式で入力してください",
    ),
  z.literal("-"),
]);

export type IdIndex = z.infer<typeof IdIndexSchema>;

/**
 * 空間IDのスキーマ
 */
export const SpatialIdSchema = z.object({
  z: z.number().int().positive("ズームレベルは正の数で指定してください"),
  f: IdIndexSchema,
  x: IdIndexSchema,
  y: IdIndexSchema,
});

export type SpatialId = z.infer<typeof SpatialIdSchema>;

/**
 * 時間IDのスキーマ
 */
export const TimeIdSchema = z.object({
  i: z.number().positive("間隔は正の数で指定してください"),
  t: IdIndexSchema,
});

export type TimeId = z.infer<typeof TimeIdSchema>;

/**
 * 時空間IDのスキーマ
 */
export const SpatiotemporalIdSchema = z.object({
  id: z.string(),
  spatial: SpatialIdSchema,
  time: TimeIdSchema.optional(),
  color: RGBAColorSchema.default({ r: 0, g: 122, b: 255, a: 150 }),
  visible: z.boolean().default(true),
});

export type SpatiotemporalId = z.infer<typeof SpatiotemporalIdSchema>;

/**
 * idを除いた時空間IDのスキーマ
 */
export const SpatiotemporalIdWithoutIdSchema = SpatiotemporalIdSchema.omit({
  id: true,
});

/**
 * idを除いた時空間IDの型定義
 */
export type SpatiotemporalIdWithoutId = z.infer<
  typeof SpatiotemporalIdWithoutIdSchema
>;

/**
 * 部分更新用のスキーマ
 */
export const SpatiotemporalIdPartialSchema = SpatiotemporalIdSchema.partial();

/**
 * 部分更新用の型定義
 */
export type SpatiotemporalIdPartial = z.infer<
  typeof SpatiotemporalIdPartialSchema
>;
