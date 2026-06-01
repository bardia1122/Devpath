"use client";

import { signIn, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";

export function SignInButton({
  callbackUrl = "/dashboard",
  size = "default",
}: {
  callbackUrl?: string;
  size?: "default" | "lg" | "sm";
}) {
  return (
    <Button size={size} onClick={() => signIn("github", { callbackUrl })}>
      <GithubIcon className="size-4" />
      Continue with GitHub
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut />
      Sign out
    </Button>
  );
}
