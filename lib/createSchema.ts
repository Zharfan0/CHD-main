import { z } from "zod";
import { featureMap } from "./featureMap";

export function createSchema(model: string) {
  const fields = featureMap[model as keyof typeof featureMap] ?? [];
  return z.object({
    nama: z.string().min(1),
    ...Object.fromEntries(fields.map(f => [f, z.string().min(1)]))
  });
}
