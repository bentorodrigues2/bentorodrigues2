export interface Patrimonio {
  tem_elevador: boolean;
  num_elevadores: number;
  tem_garagem: boolean;
  tem_piscina: boolean;
  tem_sala_comum: boolean;
  tem_arrecadacoes_comuns: boolean;
  tem_jardins: boolean;
  tem_churrasqueira: boolean;
  tem_terraco: boolean;
  tem_ginasio: boolean;
  tem_spa: boolean;
  tem_wc_piscina?: boolean;
}

export interface ChaveItem {
  id_chave: string;
  id_predio: string;
  area_nome: string;
  codigo_chave: string;
  quantidade: number;
  no_claviculario: boolean;
  num_chaveiro?: string;
  local_sugerido?: string;
  observacoes?: string;
  responsavel?: string;
}

export interface Predio {
  id_predio: string;
  nome: string | null;
  morada_linha1: string;
  morada_linha2: string | null;
  num_porta: string;
  letra_porta: string | null;
  codigo_postal: string;
  localidade: string;
  nif: string;
  patrimonio: Patrimonio;
  foto?: string | null;
  iban?: string | null;
}

export interface Conta {
  id_conta: string;
  id_predio: string;
  banco: string;
  iban: string;
  tipo: string;
  saldo: number;
  balcao?: string;
  morada_balcao?: string;
  contacto_banco?: string;
  gestor_contas?: string;
  email_gestor?: string;
  is_principal?: boolean;
}

export interface Fornecedor {
  id_fornecedor: string;
  id_predio: string;
  nome: string;
  nif: string;
  iban?: string;
  categoria: string;
  morada?: string;
  contacto?: string;
  pessoa_contacto?: string;
  telemovel_direto?: string;
  email_contacto?: string;
  data_nascimento?: string;
  perfis_pwa?: ("LIMPEZAS" | "TECNICO" | "JURIDICO" | "AUDITOR" | "CONTABILISTA")[];
  pwa_acesso_enviado?: boolean;
  pwa_password_provisoria?: string;
  foto?: string | null;
}

export interface Proprietario {
  nome: string;
  nif: string;
  email: string;
  tlm: string;
  iban?: string;
  titular_conta?: string;
  entidade_bancaria?: string;
  morada_alternativa?: string | null;
  foto?: string | null;
  data_nascimento?: string;
}

export interface Inquilino {
  nome: string;
  email: string;
  tlm: string;
  nif: string;
  foto?: string | null;
}

export interface Fracao {
  id_fracao: string;
  id_predio: string;
  fracao_nome: string;
  piso: string;
  permilagem: number;
  tipologia: string;
  tipo_access: string;
  tem_garagem_spot: boolean;
  tem_arrecadacao_box: boolean;
  is_arrendada: boolean;
  administrador_interno: string;
  notificacao_preferencial: string;
  proprietario: Proprietario;
  proprietarios_adicionais?: Proprietario[];
  inquilino: Inquilino | null;
  seguradora?: string;
  apolice_num?: string;
  apolice_validade?: string;
  apolice_doc?: string;
  solicitacao_email_incendio?: boolean;
}

export interface Aviso {
  id_aviso: string;
  id_predio: string;
  id_fracao: string;
  tipo: string;
  data: string;
  vencimento: string;
  descricao: string;
  valor: number;
  estado: string;
}

export interface Movimento {
  id_mov: string;
  id_predio: string;
  id_conta: string;
  data: string;
  tipo: string;
  valor: number;
  descricao: string;
  categoria: string;
  fotos?: string[];
  estado?: string;
  isMovimentoCego?: boolean;
  id_fracao?: string;
  metodo_pagamento?: string;
  referencia_recibo?: string;
}

export interface ReuniaoAssinatura {
  nome: string;
  fracao?: string;
  img: string; // Base64 data url of signature
  assistiuVideoconferencia?: boolean;
  dataHora?: string;
}

export interface ReuniaoVotoPresenca {
  id_voto: string;
  id_fracao?: string;
  nome: string;
  opcao: "Sim" | "Não" | "Adiar";
  dataHoraLeituraVoto: string;
  leuMensagem: boolean;
}

export interface Reuniao {
  id_reuniao: string;
  id_predio: string;
  data: string;
  hora: string;
  local_reuniao?: string;
  tema: string;
  ordens_trabalho: string;
  estado: string;
  isVideoconferencia?: boolean;
  linkVideoconferencia?: string;
  plataformaVideoconferencia?: string; // "Google Meet" | "Microsoft Teams" | "Zoom" | "Outro"
  sondagemPresencasId?: string;
  votosPresenca?: ReuniaoVotoPresenca[];
  ata?: string; // Generated official meeting minutes text
  notas_ata?: string; // Simple user-provided discussion notes
  folha_presencas?: { [fracaoId: string]: "Presente" | "Ausente" | "Representado" };
  representantes?: { [fracaoId: string]: string }; // Map of fraction ID to proxy representative name
  assinaturas?: ReuniaoAssinatura[];
}

export interface DocumentoVersao {
  id_versao: string;
  versao: number;
  data_upload: string;
  tamanho: string;
  descricao_alteracao: string;
  carregado_por: string;
}

export interface Documento {
  id_doc: string;
  id_predio: string;
  nome: string;
  tipo: string;
  data_upload: string;
  tamanho: string;
  categoria?: string;
  descricao?: string;
  visibilidade?: "Público" | "Administração";
  autor?: string;
  versoes?: DocumentoVersao[];
  tema?: string;
  ano?: string;
  sub_pasta?: string;
  fornecedor?: string;
  arquivado?: boolean;
  data_arquivamento?: string;
  tipo_arquivo?: "documento" | "fotografia";
  url_foto?: string;
  relevancia_perfis?: ("ADMIN" | "EMPRESA_GESTORA" | "USER" | "TECNICO" | "LIMPEZAS" | "JURIDICO" | "AUDITOR" | "CONTABILISTA")[];
}

export interface OcorrenciaFoto {
  name: string;
  preview: string;
  size: string;
}

export interface Ocorrencia {
  id_ocorr: string;
  id_predio: string;
  id_fracao: string;
  descricao: string;
  data: string;
  estado: string;
  medidas_tomadas: string;
  fotos: OcorrenciaFoto[];
  categoria?: string; // e.g. "Canalização", "Eletricidade", "Elevadores", "Infiltrações", "Estrutura", "Serralharia", "Limpeza", "Segurança", "Outros"
  tecnico_atribuido?: string; // Name of assigned technician/company
  classificacao?: string; // e.g. "manutencao" | "intervencao" | "obra"
}

export interface LoggedUser {
  nome: string;
  email: string;
  role: "ADMIN" | "EMPRESA_GESTORA" | "USER" | "TECNICO" | "LIMPEZAS" | "JURIDICO" | "AUDITOR" | "CONTABILISTA";
}

export interface Reserva {
  id_reserva: string;
  id_predio: string;
  id_fracao: string;
  area_comum: string; // "Ginásio" | "Spa" | "Salão de Festas" | "Churrasqueira" | "Piscina"
  data: string; // DD-MM-YYYY
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  responsavel: string;
  num_pessoas: number;
  estado?: "Pendente" | "Aprovado" | "Rejeitado";
  servicos_adicionais?: string[];
}

export interface CapacidadeLimite {
  area_comum: string;
  limite: number;
}

export interface AuditLogEntry {
  id_log: string;
  id_predio: string;
  usuario: string;
  email: string;
  role: string;
  data_hora: string; // ISO string or DD-MM-YYYY HH:mm:ss
  seccao: "Financeiro" | "Documental" | "Assembleias" | "Frações" | "Ocorrências" | "Configurações" | "Reservas" | "Geral";
  descricao: string;
  valores_anteriores?: string;
  valores_posteriores?: string;
  ip?: string;
  dispositivo?: string;
}


