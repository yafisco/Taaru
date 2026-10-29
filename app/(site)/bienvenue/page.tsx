import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Camera,
  Check,
  ChevronDown,
  MessageCircle,
  NotebookPen,
  PartyPopper,
  PhoneCall,
  Ruler,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Apparition } from "@/components/landing/apparition";
import { ApercuWhatsApp } from "@/components/landing/apercu-whatsapp";
import { DemoFete } from "@/components/landing/demo-fete";
import { VideoFond } from "@/components/landing/video-fond";
import { cn } from "@/lib/utils";

// Servie sur « / » aux visiteurs non connectés (réécriture dans lib/supabase/middleware.ts).
// Page 100 % statique : aucune lecture de session, elle s'affiche instantanément.
export const metadata: Metadata = {
  title: "Taaru · L'app des tailleurs et couturières du Sénégal",
  description:
    "Commandes, mesures, acomptes et reste à payer au même endroit. Tes clients prévenus sur WhatsApp en 1 clic, en français ou en wolof. Gratuit pour commencer.",
  alternates: { canonical: "/" },
};

const PROBLEMES = [
  { icone: NotebookPen, texte: "60 commandes dans la tête, ou dans un cahier qui s'abîme." },
  { icone: Ruler, texte: "Tu remesures le client à chaque fois… et parfois tu te trompes." },
  { icone: Banknote, texte: "« Il m'a donné 10 000 ou 15 000 ? » Des disputes et de l'argent perdu." },
  { icone: PhoneCall, texte: "Avant la Tabaski, le téléphone sonne sans arrêt : « C'est prêt ? »" },
];

const ETAPES = [
  { titre: "Prends le tissu en photo", texte: "Le client, le modèle, la photo : c'est enregistré." },
  { titre: "Note le prix et l'acompte", texte: "Espèces, Wave ou Orange Money. Le reste à payer se calcule tout seul." },
  { titre: "Préviens sur WhatsApp", texte: "Quand c'est prêt, un clic suffit : le message part déjà rédigé." },
];

const FONCTIONS = [
  { icone: Ruler, titre: "Fiche mesures", texte: "Les mesures de chaque client, enregistrées une fois pour toutes." },
  { icone: Wallet, titre: "Acomptes et reste à payer", texte: "Chaque paiement est noté. Plus jamais de dispute sur l'argent." },
  { icone: Camera, titre: "Photo du tissu", texte: "Plus de confusion entre deux tissus. Photos légères, même en 3G." },
  { icone: MessageCircle, titre: "WhatsApp en 1 clic", texte: "Reçu, « c'est prêt », relance : en français ou en wolof." },
  { icone: PartyPopper, titre: "Mode fête", texte: "Compte à rebours Tabaski, Korité, Magal, Gamou et alerte si tu es complet." },
  { icone: Smartphone, titre: "Sur ton téléphone", texte: "Rien à télécharger sur le Play Store. Marche sur tous les Android." },
];

const QUESTIONS = [
  {
    q: "Faut-il un ordinateur ?",
    r: "Non. Taaru est fait pour le téléphone. Tu l'ouvres dans Chrome et tu l'ajoutes à ton écran d'accueil comme une application.",
  },
  {
    q: "Et si ma connexion est faible ?",
    r: "Les photos sont compressées avant l'envoi et les pages sont très légères. Taaru a été pensé pour la 3G.",
  },
  {
    q: "Qui peut voir mes clients et mon argent ?",
    r: "Toi seul. Chaque atelier a son espace privé, protégé par ton numéro et ton code PIN.",
  },
  {
    q: "Mes clients doivent-ils installer quelque chose ?",
    r: "Non. Ils reçoivent un simple message WhatsApp, envoyé depuis ton téléphone.",
  },
  {
    q: "Comment payer Taaru Pro ?",
    r: "Par Wave. Tu commences gratuitement et tu passes à Pro seulement si Taaru t'aide vraiment.",
  },
];

function BoutonPrincipal({ className }: { className?: string }) {
  return (
    <Link
      href="/inscription"
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-full bg-or px-7 text-lg font-bold text-or-foreground shadow-lg shadow-black/20 transition hover:brightness-105 active:scale-95",
        className
      )}
    >
      Créer mon atelier gratuitement
    </Link>
  );
}

function TitreSection({ sur, titre, clair = false }: { sur?: string; titre: string; clair?: boolean }) {
  return (
    <Apparition className="mx-auto mb-10 max-w-2xl text-center">
      {sur && (
        <p className={cn("mb-2 text-sm font-semibold tracking-widest uppercase", clair ? "text-or" : "text-primary")}>{sur}</p>
      )}
      <h2 className={cn("font-titres text-4xl leading-tight md:text-5xl", clair ? "text-white" : "text-foreground")}>{titre}</h2>
    </Apparition>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white text-foreground">
      {/* ——— Haut de page : vidéo de Dakar ——— */}
      <header className="relative flex min-h-svh flex-col overflow-hidden bg-primary text-white">
        <VideoFond
          mobile={{ video: "/videos/dakar-mobile.mp4", poster: "/videos/dakar-mobile.jpg" }}
          ordinateur={{ video: "/videos/dakar-ordinateur.mp4", poster: "/videos/dakar-ordinateur.jpg" }}
          classeBouton="right-4 bottom-5"
        />
        {/* Voile vert pétrole : assure la lisibilité du texte sur la vidéo */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/85 via-primary/65 to-primary/95" aria-hidden />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-end px-4 py-4">
          <Link href="/connexion" className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/10">
            Se connecter
          </Link>
        </nav>

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo transparent, 72 Ko, affiché tout de suite */}
          <img
            src="/logo-transparent.png"
            alt="Taaru : Couds. Taaru gère le reste."
            width={720}
            height={395}
            className="h-auto w-72 animate-in drop-shadow-lg duration-1000 fade-in slide-in-from-bottom-4 md:w-104"
          />
          <h1 className="mt-8 font-titres text-5xl leading-[1.05] animate-in duration-1000 fade-in slide-in-from-bottom-4 md:text-7xl">
            Fini le cahier perdu.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90 animate-in duration-1000 fade-in md:text-xl">
            Tes clients, leurs mesures et leur argent au même endroit. Et ils sont prévenus sur WhatsApp en 1 clic.
          </p>
          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto">
            <BoutonPrincipal className="w-full sm:w-auto" />
            <p className="text-sm text-white/75">Gratuit · Rien à télécharger · Marche sur tous les Android</p>
          </div>
        </div>

        <a href="#probleme" className="relative z-10 mx-auto mb-6 animate-bounce text-white/80" aria-label="Découvrir Taaru">
          <ChevronDown className="size-8" />
        </a>
      </header>

      <main>
        {/* ——— Le problème ——— */}
        <section id="probleme" className="scroll-mt-4 bg-creme/40 px-4 py-20">
          <TitreSection sur="Tailleurs, couturières" titre="Tu te reconnais ?" />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMES.map(({ icone: Icone, texte }, i) => (
              <Apparition key={texte} delai={i * 100}>
                <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <Icone className="mb-4 size-8 text-primary" />
                  <p className="text-lg leading-snug">{texte}</p>
                </div>
              </Apparition>
            ))}
          </div>
          <Apparition className="mt-10 text-center">
            <p className="font-titres text-3xl text-primary italic">Taaru s&apos;occupe de tout ça.</p>
          </Apparition>
        </section>

        {/* ——— Comment ça marche : vidéo de la couturière ——— */}
        <section className="px-4 py-20">
          <TitreSection sur="Comment ça marche" titre="Une commande en moins de 60 secondes" />
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <Apparition>
              <div className="relative aspect-video overflow-hidden rounded-3xl bg-primary shadow-xl">
                <VideoFond differe mobile={{ video: "/videos/couturiere.mp4", poster: "/videos/couturiere.jpg" }} />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">
                  ⏱ &lt; 60 s
                </div>
              </div>
            </Apparition>
            <ol className="space-y-6">
              {ETAPES.map((e, i) => (
                <Apparition key={e.titre} delai={i * 150}>
                  <li className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{e.titre}</h3>
                      <p className="mt-1 text-muted-foreground">{e.texte}</p>
                    </div>
                  </li>
                </Apparition>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— Fonctionnalités ——— */}
        <section className="bg-creme/40 px-4 py-20">
          <TitreSection sur="Tout ce qu'il faut" titre="Pensé pour les ateliers d'ici" />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FONCTIONS.map(({ icone: Icone, titre, texte }, i) => (
              <Apparition key={titre} delai={(i % 3) * 100}>
                <div className="group h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icone className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{titre}</h3>
                  <p className="mt-1 text-muted-foreground">{texte}</p>
                </div>
              </Apparition>
            ))}
          </div>
        </section>

        {/* ——— WhatsApp ——— */}
        <section className="bg-primary px-4 py-20 text-white">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
            <Apparition>
              <p className="mb-2 text-sm font-semibold tracking-widest text-or uppercase">WhatsApp</p>
              <h2 className="font-titres text-4xl leading-tight md:text-5xl">« C&apos;est prêt ? » Ils le savent avant d&apos;appeler.</h2>
              <p className="mt-5 text-lg text-white/85">
                Quand la tenue est prête, Taaru écrit le message à ta place, avec le reste à payer. Tu n&apos;as qu&apos;à
                appuyer sur Envoyer. En français ou en wolof, comme tu préfères.
              </p>
            </Apparition>
            <Apparition delai={150}>
              <ApercuWhatsApp />
            </Apparition>
          </div>
        </section>

        {/* ——— Mode fête ——— */}
        <section className="relative overflow-hidden px-4 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
            <Apparition className="md:order-2">
              <p className="mb-2 text-sm font-semibold tracking-widest text-primary uppercase">Mode fête</p>
              <h2 className="font-titres text-4xl leading-tight md:text-5xl">La Tabaski sans la panique.</h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Dis à Taaru combien de tenues ton atelier coud par semaine. Il compte les jours, les commandes, et
                t&apos;alerte avant que tu acceptes une commande de trop.
              </p>
            </Apparition>
            <Apparition delai={150} className="md:order-1">
              <DemoFete />
            </Apparition>
          </div>
        </section>

        {/* ——— Prix ——— */}
        <section id="prix" className="bg-creme/40 px-4 py-20">
          <TitreSection sur="Prix" titre="Commence gratuitement" />
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <Apparition>
              <div className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
                <h3 className="text-xl font-semibold">Gratuit</h3>
                <p className="mt-3 font-titres text-5xl">0 FCFA</p>
                <p className="mt-1 text-muted-foreground">Pour démarrer</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {["Jusqu'à 30 commandes en cours", "Clients et mesures", "Acomptes et reste à payer", "Messages WhatsApp FR / wolof"].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" /> {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/inscription"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-full border-2 border-primary font-semibold text-primary hover:bg-primary/5"
                >
                  Commencer
                </Link>
              </div>
            </Apparition>
            <Apparition delai={150}>
              <div className="relative flex h-full flex-col rounded-3xl bg-primary p-7 text-white shadow-xl">
                <span className="absolute -top-3 right-6 rounded-full bg-or px-3 py-1 text-xs font-bold text-or-foreground">
                  Saison des fêtes
                </span>
                <h3 className="text-xl font-semibold">Taaru Pro</h3>
                <p className="mt-3 font-titres text-5xl">
                  3 000 <span className="text-2xl">FCFA/mois</span>
                </p>
                <p className="mt-1 text-white/80">ou 15 000 FCFA la saison Tabaski (3 mois)</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {["Commandes en cours illimitées", "Tout ce qui est dans Gratuit", "Idéal pour la saison des fêtes", "Payé simplement par Wave"].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-5 shrink-0 text-or" /> {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/inscription"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-or font-bold text-or-foreground hover:brightness-105"
                >
                  Essayer gratuitement
                </Link>
              </div>
            </Apparition>
          </div>
        </section>

        {/* ——— Questions ——— */}
        <section className="px-4 py-20">
          <TitreSection sur="Questions" titre="Tu te demandes peut-être…" />
          <div className="mx-auto max-w-2xl divide-y rounded-2xl ring-1 ring-black/10">
            {QUESTIONS.map(({ q, r }) => (
              <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-muted-foreground">{r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ——— Appel final ——— */}
        <section className="bg-primary px-4 py-20 text-center text-white">
          <Apparition className="mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto mb-4 size-10 text-or" />
            <h2 className="font-titres text-4xl leading-tight md:text-5xl">Couds. Taaru gère le reste.</h2>
            <p className="mt-4 text-lg text-white/85">Ton atelier prêt en 1 minute, avec ton numéro de téléphone.</p>
            <BoutonPrincipal className="mt-8 w-full sm:w-auto" />
          </Apparition>
        </section>
      </main>

      <footer className="bg-[#0b3e42] px-4 py-8 text-center text-sm text-white/70">
        <p>© 2026 Taaru · Une solution YafaBizDigital, Thiès (Sénégal)</p>
        <p className="mt-2 text-xs text-white/50">
          Vidéos : Christopher Junior (Dakar) et Joaquin Reyes Ramos, via Pexels
        </p>
      </footer>
    </div>
  );
}
