import { z } from "zod";
import { RGBAColorSchema } from "../color";
import { SpatialIdSchema } from "./spatialId";

export const SpatialIdGroupSchema = z.object({
  id: z.string(),
  color: RGBAColorSchema,
  spatialIds: z.array(SpatialIdSchema),
});

/**
 * 空間IDグループ
 */
export type SpatialIdGroup = z.infer<typeof SpatialIdGroupSchema>;

export const SpatialIdGroupWithoutIdSchema = SpatialIdGroupSchema.omit({
  id: true,
});

export const SpatialIdGroupPartialSchema = SpatialIdGroupSchema.partial();
