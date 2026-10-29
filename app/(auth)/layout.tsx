import Image from "next/image";
import logo from "@/public/logo.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-8">
      <div className="mb-8 w-full max-w-sm overflow-hidden rounded-2xl bg-primary px-6 py-5">
        <Image src={logo} alt="Taaru : Couds. Taaru gère le reste." priority className="h-auto w-full" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
