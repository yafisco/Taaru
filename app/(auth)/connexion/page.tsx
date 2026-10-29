import type { Metadata } from "next";
import { ConnexionForm } from "./connexion-form";

export const metadata: Metadata = { title: "Connexion · Taaru" };

export default function ConnexionPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Connexion</h2>
      <ConnexionForm />
    </>
  );
}
