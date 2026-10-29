import type { Metadata } from "next";
import { InscriptionForm } from "./inscription-form";

export const metadata: Metadata = { title: "Créer mon atelier · Taaru" };

export default function InscriptionPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Créer mon atelier</h2>
      <InscriptionForm />
    </>
  );
}
