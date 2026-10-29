import { z } from "zod";
import { FETES } from "@/lib/fete";

export const reglagesSchema = z
  .object({
    nom: z.string().trim().min(2, "Entre le nom de ton atelier").max(60, "Nom trop long"),
    langue: z.enum(["fr", "wo"]),
    capacite: z.number({ error: "Entre un nombre" }).int("Nombre entier").min(1, "Au moins 1").max(200, "Maximum 200"),
    fete: z.enum(FETES.map((f) => f.cle) as [string, ...string[]]).nullable(),
    feteDate: z.string(),
  })
  .refine((v) => !v.fete || z.iso.date().safeParse(v.feteDate).success, {
    path: ["feteDate"],
    message: "Choisis la date de la fête",
  });

export type ReglagesValeurs = z.infer<typeof reglagesSchema>;
