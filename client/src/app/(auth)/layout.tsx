import Link from "next/link";
import Logo from "@/components/branding/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-6 left-6">
        <Link href="/" className="font-bold text-2xl">
          <Logo size="40px" />
        </Link>
      </div>
      <div className="flex w-full max-w-md flex-col gap-6">{children}</div>
    </div>
  );
}
