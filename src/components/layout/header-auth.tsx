import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  loginLabel: string;
};

/**
 * Header auth slot.
 *
 * Anonymous: shows "Masuk" link → /auth/login.
 * Authenticated: shows email + dropdown with role badge + logout.
 *
 * Renders as RSC; revalidated on layout when auth state changes
 * (signOut() calls revalidatePath("/", "layout")).
 */
export async function HeaderAuth({ loginLabel }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="hidden sm:inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
      >
        {loginLabel}
      </Link>
    );
  }

  const initial =
    user.displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "·";
  const label = user.displayName ?? user.email ?? "Akun";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hidden sm:inline-flex items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground hover:border-foreground/40 transition-colors"
        aria-label="User menu"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
          {initial}
        </span>
        <span className="max-w-[140px] truncate">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <div className="text-xs font-medium">{label}</div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground">
            {user.role}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/akun" className="cursor-pointer text-sm">
            <User className="mr-2 size-4" aria-hidden="true" />
            Akun saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/auth/logout" className="cursor-pointer text-sm">
            <LogOut className="mr-2 size-4" aria-hidden="true" />
            Keluar
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
