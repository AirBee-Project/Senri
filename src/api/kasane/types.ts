import { z } from "zod";

/**
 * Kasane OpenAPI (openapi.yaml) の components を写した zod スキーマ・型。
 */

export const TableDataTypeSchema = z.enum(["Text", "Int", "Float", "Boolean"]);
export type TableDataType = z.infer<typeof TableDataTypeSchema>;

export const ZoomLevelPolicySchema = z.enum(["Error", "Ignore", "Normalize"]);
export type ZoomLevelPolicy = z.infer<typeof ZoomLevelPolicySchema>;

/** 範囲指定の時空間ID（リクエストで使用） */
export type RangeId = {
  z: number;
  f: [number, number];
  x: [number, number];
  y: [number, number];
  type: "rangeId";
};

/** /data/search に渡す空間ID（今回は範囲指定のみ使用） */
export type SpatialIdRequest = RangeId;

// biome-ignore lint/suspicious/noExplicitAny: クエリを手で組み立てられるようにするため
export type QueryNode = any;

/** /query のリクエストボディ */
export type ExecuteQueryRequest = {
  value_type?: TableDataType | null;
  spatial_ids: SpatialIdRequest[];
  query: QueryNode;
};

const DataGroupSchema = z.object({
  valueRef: z.number().int(),
  spatialIds: z.array(z.any()),
});
export type DataGroup = z.infer<typeof DataGroupSchema>;

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
});
export type TableInfo = z.infer<typeof TableInfoResponseSchema>;
export const TableListSchema = z.array(TableInfoResponseSchema);
