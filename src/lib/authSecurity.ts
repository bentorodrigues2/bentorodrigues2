// Module for Auth Security, Brute Force Protection, Security Logging & Password Validation

export interface SecurityLog {
  id: string;
  timestamp: string;
  ip: string;
  userEmail: string;
  eventType: 
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "COOLDOWN_ACTIVATED"
    | "BOT_CHALLENGE_PASSED"
    | "ACCOUNT_LOCKED_BRUTE_FORCE"
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET_SUCCESS";
  details: string;
}

export interface UserSecurityState {
  email: string;
  failedAttempts: number;
  cooldownUntil: number | null; // timestamp ms
  cooldownPassed: boolean;
  postCooldownAttempts: number;
  isLocked: boolean;
  mustResetPassword: boolean;
  passwordHistory: string[]; // last 5 passwords
  botChallengeRequired: boolean;
}

export const INITIAL_USER_SECURITY = (email: string): UserSecurityState => ({
  email,
  failedAttempts: 0,
  cooldownUntil: null,
  cooldownPassed: false,
  postCooldownAttempts: 0,
  isLocked: false,
  mustResetPassword: false,
  passwordHistory: ["SenhaAntiga123!", "CondoManager2025!"],
  botChallengeRequired: false,
});

// Common weak / top passwords blacklist
export const COMMON_WEAK_PASSWORDS = [
  "123456789012",
  "password123!",
  "admin123456!",
  "condo123456!",
  "portugal123!",
  "qwerty123456",
  "letmein123456",
  "welcome12345",
  "123456abcdef",
  "condomanager1",
  "administrador1",
  "mudar123456!",
  "123456789000",
  "password1234",
  "iloveyou1234",
  "1234567890",
  "password",
  "123456"
];

// Validate password strength against security policy
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  label: "Fraca" | "Média" | "Forte" | "Excelente";
  errors: string[];
  criteria: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
    notCommon: boolean;
    notInHistory: boolean;
  };
}

export function validatePasswordPolicy(
  password: string,
  history: string[] = []
): PasswordValidationResult {
  const minLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const lowerPass = password.toLowerCase();
  const notCommon = !COMMON_WEAK_PASSWORDS.some(
    (weak) => lowerPass === weak.toLowerCase() || (weak.length >= 6 && lowerPass.includes(weak.toLowerCase()))
  );

  const notInHistory = !history.some((oldPass) => oldPass === password);

  const errors: string[] = [];
  if (!minLength) errors.push("A palavra-passe deve ter pelo menos 12 caracteres.");
  if (!hasUppercase) errors.push("Inclua pelo menos uma letra maiúscula (A-Z).");
  if (!hasLowercase) errors.push("Inclua pelo menos uma letra minúscula (a-z).");
  if (!hasNumber) errors.push("Inclua pelo menos um número (0-9).");
  if (!hasSymbol) errors.push("Inclua pelo menos um símbolo especial (!@#$%...).");
  if (!notCommon) errors.push("Esta palavra-passe consta da lista de passwords comuns ou fracas.");
  if (!notInHistory) errors.push("Não pode reutilizar nenhuma das suas últimas 5 palavras-passe.");

  const passedCount = [
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    notCommon,
    notInHistory,
  ].filter(Boolean).length;

  const score = Math.round((passedCount / 7) * 100);
  let label: "Fraca" | "Média" | "Forte" | "Excelente" = "Fraca";

  if (score >= 100) label = "Excelente";
  else if (score >= 75) label = "Forte";
  else if (score >= 50) label = "Média";

  const isValid = errors.length === 0;

  return {
    isValid,
    score,
    label,
    errors,
    criteria: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSymbol,
      notCommon,
      notInHistory,
    },
  };
}

export function getSimulatedClientIp(): string {
  return "193.137.21.108";
}

// Security Audit Log Helper
export function createSecurityLog(
  userEmail: string,
  eventType: SecurityLog["eventType"],
  details: string
): SecurityLog {
  const log: SecurityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    ip: getSimulatedClientIp(),
    userEmail,
    eventType,
    details,
  };

  try {
    const existingStr = localStorage.getItem("supabase_security_logs") || "[]";
    const existing: SecurityLog[] = JSON.parse(existingStr);
    existing.unshift(log);
    // Keep last 100 logs
    localStorage.setItem("supabase_security_logs", JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error("Error saving security log to Supabase storage", e);
  }

  return log;
}

export function getSecurityLogs(): SecurityLog[] {
  try {
    const existingStr = localStorage.getItem("supabase_security_logs");
    if (!existingStr) {
      const defaultLogs: SecurityLog[] = [
        {
          id: "log-init-1",
          timestamp: new Date(Date.now() - 3600000).toISOString().replace("T", " ").substring(0, 19),
          ip: "193.137.21.108",
          userEmail: "carlos.adm@condomanager.pt",
          eventType: "LOGIN_SUCCESS",
          details: "Autenticação via Supabase Auth + Biometria aprovada."
        }
      ];
      localStorage.setItem("supabase_security_logs", JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return JSON.parse(existingStr);
  } catch {
    return [];
  }
}
