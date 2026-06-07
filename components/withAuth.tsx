"use client";
// components/withAuth.tsx
// HOC untuk proteksi halaman yang membutuhkan autentikasi.
// Gunakan: export default withAuth(MyPage) atau withAuth(MyPage, "admin")

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, TokenPayload } from "@/lib/auth";

interface WithAuthOptions {
  requiredRole?: "user" | "admin";
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P & { currentUser: TokenPayload }>,
  options: WithAuthOptions = {}
) {
  return function ProtectedPage(props: P) {
    const router = useRouter();
    const [user, setUser] = useState<TokenPayload | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const current = getCurrentUser();

      if (!current) {
        router.replace("/login");
        return;
      }

      // Jika halaman khusus admin dan user bukan admin
      if (options.requiredRole === "admin" && current.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setUser(current);
      setChecking(false);
    }, [router]);

    if (checking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Memeriksa sesi...</p>
          </div>
        </div>
      );
    }

    if (!user) return null;

    return <Component {...props} currentUser={user} />;
  };
}
