"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function signInAction(formData: FormData) {
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!email || !password) {
    redirect(`/auth/sign-in?error=${encodeMessage("Email and password are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/sign-in?error=${encodeMessage(error.message)}`);
  }

  redirect("/game");
}

export async function signUpAction(formData: FormData) {
  const displayName = readText(formData, "displayName");
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!displayName || !email || !password) {
    redirect(`/auth/sign-up?error=${encodeMessage("Display name, email, and password are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirect(`/auth/sign-up?error=${encodeMessage(error.message)}`);
  }

  redirect(`/auth/sign-in?message=${encodeMessage("Account created. Sign in after any required email confirmation.")}`);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
