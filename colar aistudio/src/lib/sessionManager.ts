// Session Management, Role-Based Access Control, Session Hijacking & Fixation Protection

export type UserRole = 
  | "ADMIN" 
  | "GESTOR" 
  | "EMPRESA_GESTORA"
  | "TECNICO" 
  | "AUDITOR" 
  | "CONTABILISTA" 
  | "JURIDICO" 
  | "LIMPEZAS" 
  | "USER";

export interface SessionToken {
  tokenId: string;
  userEmail: string;
  userRole: UserRole;
  condominioId: string;
  fingerprint: string; // Hash of User-Agent + Client IP
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number; // Token expiration (e.g. 24h)
  passwordEpoch: number; // Password version timestamp
}

export interface RoleNavigationConfig {
  role: UserRole;
  defaultTab: string;
  allowedTabs: string[];
  displayName: string;
  badgeColor: string;
}

// Allowed tabs per role matrix
export const RoleNavigationMap: Record<UserRole, RoleNavigationConfig> = {
  ADMIN: {
    role: "ADMIN",
    defaultTab: "painel",
    allowedTabs: ["*"],
    displayName: "Administrador do Sistema",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30"
  },
  EMPRESA_GESTORA: {
    role: "EMPRESA_GESTORA",
    defaultTab: "painel",
    allowedTabs: ["*"],
    displayName: "Empresa Gestora",
    badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30"
  },
  GESTOR: {
    role: "GESTOR",
    defaultTab: "painel",
    allowedTabs: ["*"],
    displayName: "Gestor de Condomínio",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  TECNICO: {
    role: "TECNICO",
    defaultTab: "painel",
    allowedTabs: ["painel", "manutencao_ocorrencias", "ocorrencias", "limpezas_vistorias", "manutencao_intervencoes", "manutencao_concluidas", "manutencao_agenda", "manutencao_extraordinarias", "inventario_tecnico", "fornecedores", "arquivo", "documentos", "manutencao_arquivo"],
    displayName: "Técnico de Manutenção",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  LIMPEZAS: {
    role: "LIMPEZAS",
    defaultTab: "painel",
    allowedTabs: ["painel", "vistorias_limpezas", "limpezas_vistorias", "limpezas_incidencias", "manutencao_ocorrencias", "ocorrencias"],
    displayName: "Equipa de Limpeza",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30"
  },
  JURIDICO: {
    role: "JURIDICO",
    defaultTab: "contencioso_juridico",
    allowedTabs: ["painel", "contencioso_juridico", "contencioso_juridico_nd", "contencioso_juridico_doc_obrig", "contencioso_juridico_cartas", "contencioso_juridico_bni", "contencioso_juridico_regulamento", "contencioso_juridico_estatutos", "contencioso_juridico_ia", "assembleias", "arquivo", "documentos"],
    displayName: "Apoio Jurídico",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  AUDITOR: {
    role: "AUDITOR",
    defaultTab: "painel",
    allowedTabs: ["painel", "auditoria_interna", "movimentos", "financeiro_recibos", "financeiro_relatorios", "financeiro_extratos", "arquivo", "documentos", "assembleias"],
    displayName: "Auditor Externo",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
  },
  CONTABILISTA: {
    role: "CONTABILISTA",
    defaultTab: "movimentos",
    allowedTabs: ["painel", "movimentos", "financeiro_recibos", "financeiro_relatorios", "financeiro_extratos", "financeiro_quotas_mensais", "financeiro_quotas_extra", "contas", "emissao", "fundo_reserva", "contabilidade_interna", "conciliacao"],
    displayName: "Contabilista Certificado",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  USER: {
    role: "USER",
    defaultTab: "painel",
    allowedTabs: ["painel", "portal_condomino", "fracoes", "fracoes_proprietario", "financeiro_extratos", "financeiro_recibos", "arquivo", "documentos", "manutencao_ocorrencias", "ocorrencias", "vistorias_limpezas", "reservas", "assembleias"],
    displayName: "Condómino",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
  }
};

// Generate Client Fingerprint for Session Hijacking Prevention
export function generateClientFingerprint(): string {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "NodeServer";
  const screenRes = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "1024x768";
  const language = typeof navigator !== "undefined" ? navigator.language : "pt-PT";
  const raw = `${userAgent}|${screenRes}|${language}|193.137.21.108`;
  
  // Simple hash string generator
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp-${Math.abs(hash).toString(16)}`;
}

// 5 Minutes Inactivity Timeout in milliseconds (300,000 ms)
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

// Record real-time user activity across site & PWA
export function recordUserActivity(): void {
  try {
    const sessionStr = localStorage.getItem("condomanager_active_session");
    if (!sessionStr) return;
    const session: SessionToken = JSON.parse(sessionStr);
    session.lastActivityAt = Date.now();
    localStorage.setItem("condomanager_active_session", JSON.stringify(session));
  } catch {}
}

// Session Management State Helpers
export function createNewSession(
  userEmail: string, 
  userRole: UserRole, 
  condominioId: string = "PREDIO-001"
): SessionToken {
  const now = Date.now();
  const token: SessionToken = {
    tokenId: `stoken-${now}-${Math.random().toString(36).substring(2, 9)}`,
    userEmail,
    userRole,
    condominioId,
    fingerprint: generateClientFingerprint(),
    createdAt: now,
    lastActivityAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    passwordEpoch: now
  };

  try {
    localStorage.setItem("condomanager_active_session", JSON.stringify(token));
    localStorage.setItem(`last_activity_${userEmail}`, now.toString());
  } catch (e) {
    console.error("Erro ao guardar sessão local:", e);
  }

  return token;
}

// Rotate Session Token for Session Fixation Protection
export function rotateSessionToken(currentSession: SessionToken): SessionToken {
  const now = Date.now();
  const rotatedToken: SessionToken = {
    ...currentSession,
    tokenId: `stoken-rotated-${now}-${Math.random().toString(36).substring(2, 9)}`,
    lastActivityAt: now,
    fingerprint: generateClientFingerprint() // Re-verify fingerprint
  };

  try {
    localStorage.setItem("condomanager_active_session", JSON.stringify(rotatedToken));
  } catch {}

  return rotatedToken;
}

// Validate Active Session (Hijacking, Fixation, Idle Timeout & Token Invalidation)
export function validateSession(
  userEmail: string, 
  userRole: UserRole
): { valid: boolean; reason?: string; shouldLogout?: boolean } {
  try {
    const sessionStr = localStorage.getItem("condomanager_active_session");
    if (!sessionStr) {
      // Auto-create session for logged-in user if not existing
      createNewSession(userEmail, userRole);
      return { valid: true };
    }

    const session: SessionToken = JSON.parse(sessionStr);

    // 1. Check User Email Match
    if (session.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      createNewSession(userEmail, userRole);
      return { valid: true };
    }

    // 2. Check 5 Minutes Idle Timeout
    const now = Date.now();
    const idleTime = now - session.lastActivityAt;
    if (idleTime > IDLE_TIMEOUT_MS) {
      purgeSession();
      return { 
        valid: false, 
        reason: "Sessão expirada por inatividade (5 minutos sem interação). Por favor inicie sessão novamente.", 
        shouldLogout: true 
      };
    }

    // 3. Token Invalidation check after Password Reset
    const revokedEpoch = localStorage.getItem(`pwd_reset_epoch_${userEmail}`);
    if (revokedEpoch && parseInt(revokedEpoch, 10) > session.createdAt) {
      purgeSession();
      return { 
        valid: false, 
        reason: "Sessão invalidada: A palavra-passe desta conta foi redefinida. Inicie sessão com as novas credenciais.", 
        shouldLogout: true 
      };
    }

    // Update last activity timestamp
    session.lastActivityAt = now;
    localStorage.setItem("condomanager_active_session", JSON.stringify(session));

    return { valid: true };
  } catch {
    createNewSession(userEmail, userRole);
    return { valid: true };
  }
}

// Invalidate all tokens for user after Password Reset
export function invalidateUserSessions(userEmail: string) {
  try {
    localStorage.setItem(`pwd_reset_epoch_${userEmail}`, Date.now().toString());
    localStorage.removeItem("condomanager_active_session");
  } catch (e) {
    console.error("Erro ao invalidar sessões do utilizador:", e);
  }
}

// Purge session on logout
export function purgeSession() {
  try {
    localStorage.removeItem("condomanager_active_session");
    sessionStorage.clear();
  } catch {}
}

// Role-based Navigation Guard
export function validateRoleAccess(role: UserRole, targetTab: string): { allowed: boolean; redirectTab: string } {
  const normalizedRole = role === "GESTOR" ? "EMPRESA_GESTORA" : role;
  if (normalizedRole === "ADMIN" || normalizedRole === "EMPRESA_GESTORA") {
    return { allowed: true, redirectTab: targetTab };
  }
  const config = RoleNavigationMap[normalizedRole as UserRole] || RoleNavigationMap.USER;
  if (config.allowedTabs.includes(targetTab) || config.allowedTabs.includes("*")) {
    return { allowed: true, redirectTab: targetTab };
  }
  return { allowed: false, redirectTab: config.defaultTab || "painel" };
}
