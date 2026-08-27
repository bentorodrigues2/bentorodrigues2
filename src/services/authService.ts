import { supabase } from "../lib/supabase";

/**
 * Validação mínima da política de password.
 * O AI Studio usa isto para validar password antes de enviar para o Supabase.
 */
export function validatePasswordPolicy(password: string): boolean {
  if (!password) return false;
  return password.length >= 6; // regra mínima por agora
}

/**
 * Criação de logs de segurança.
 * O AI Studio chama isto sempre que há login, logout, falha, etc.
 * Mais tarde podemos guardar isto numa tabela do Supabase.
 */
export async function createSecurityLog(event: string, email?: string) {
  console.log("Security Log:", {
    event,
    email,
    timestamp: new Date().toISOString(),
  });

  // Quando quiseres ativar logs reais:
  // await supabase.from("security_logs").insert({ event, email, timestamp: new Date().toISOString() });
}

/**
 * Enviar magic link (AI Studio usa isto no modo passwordless)
 */
export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

/**
 * Verificar OTP (AI Studio usa isto no login por código)
 */
export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
  return data;
}

