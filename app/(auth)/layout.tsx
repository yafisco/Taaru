export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-12 pb-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary text-4xl font-bold text-primary-foreground">
          t
        </div>
        <h1 className="text-2xl font-bold text-primary">Taaru</h1>
        <p className="text-sm text-muted-foreground">Chaque commande sous contrôle, même à la Tabaski.</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
