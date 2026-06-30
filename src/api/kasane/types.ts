import { z } from "zod";

/**
 * Kasane OpenAPI (openapi.yaml) の components を写した zod スキーマ・型。
 */

export const TableDataTypeSchema = z.enum(["Text", "Int", "Float", "Boolean"]);
export type TableDataType = z.infer<typeof TableDataTypeSchema>;

export const ZoomLevelPolicySchema = z.enum(["Error", "Ignore", "Normalize"]);
export type ZoomLevelPolicy = z.infer<typeof ZoomLevelPolicySchema>;

/** 単一セルの時空間ID */
export const SingleIdSchema = z.object({
  z: z.number().int(),
  f: z.number().int(),
  x: z.number().int(),
  y: z.number().int(),
  type: z.literal("singleId").optional(),
});
export type SingleId = z.infer<typeof SingleIdSchema>;

/** 範囲指定の時空間ID */
export const RangeIdSchema = z.object({
  z: z.number().int(),
  f: z.tuple([z.number().int(), z.number().int()]),
  x: z.tuple([z.number().int(), z.number().int()]),
  y: z.tuple([z.number().int(), z.number().int()]),
  type: z.literal("rangeId").optional(),
});
export type RangeId = z.infer<typeof RangeIdSchema>;

/** Flex時空間ID */
export const FlexIdSchema = z.object({
  fZoomlevel: z.number().int(),
  fIndex: z.number().int(),
  xZoomlevel: z.number().int(),
  xIndex: z.number().int(),
  yZoomlevel: z.number().int(),
  yIndex: z.number().int(),
  type: z.literal("flexId").optional(),
});
export type FlexId = z.infer<typeof FlexIdSchema>;

export const SpatialIdSchema = z.union([
  SingleIdSchema,
  RangeIdSchema,
  FlexIdSchema,
]);
export type SpatialId = z.infer<typeof SpatialIdSchema>;

/** /data/search に渡す空間ID（今回は範囲指定のみ使用） */
export type SpatialIdRequest = RangeId;

export const SpatialDataSchema = z.object({
  id: SpatialIdSchema,
  data: z.unknown(),
});
export type SpatialData = z.infer<typeof SpatialDataSchema>;

export const DataGroupSchema = z.object({
  valueRef: z.number().int(),
  spatialIds: z.array(SpatialIdSchema),
});

export const GetDataResponseSchema = z.object({
  dictionary: z.array(z.unknown()),
  data: z.array(DataGroupSchema),
});
export type GetDataResponse = z.infer<typeof GetDataResponseSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
});

export const DatabaseInfoResponseSchema = z.object({
  name: z.string(),
});
export type DatabaseInfo = z.infer<typeof DatabaseInfoResponseSchema>;
export const DatabaseListSchema = z.array(DatabaseInfoResponseSchema);

export const TableInfoResponseSchema = z.object({
  name: z.string(),
  data_type: TableDataTypeSchema,
  max_zoom_level: z.number().int(),
  count: z.number().int().nullable().optional(),
});
export type TableInfo = z.infer<typeof TableInfoResponseSchema>;
export const TableListSchema = z.array(TableInfoResponseSchema);
