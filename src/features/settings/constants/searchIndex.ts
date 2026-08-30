export interface SettingsSearchEntry {
  /** Matches a `SettingsRow`/row-like block's `anchorId` — what the result actually scrolls to. */
  anchorId: string;
  sectionId: string;
  label: string;
}

/**
 * A flat, hand-maintained index of every named preference in
 * Configurações — deliberately not generated from the category
 * components (that would need a build step or runtime DOM walk for
 * what's a fixed, small list). Keeping `anchorId` here matching the
 * `anchorId` each category component actually renders is the one
 * thing to keep in sync when a row's copy changes.
 */
export const settingsSearchIndex: SettingsSearchEntry[] = [
  { anchorId: 'setting-geral-pagina-inicial', sectionId: 'geral', label: 'Página inicial' },
  { anchorId: 'setting-geral-continuar', sectionId: 'geral', label: 'Continuar de onde parei' },
  {
    anchorId: 'setting-geral-confirmar-acoes',
    sectionId: 'geral',
    label: 'Confirmar ações importantes',
  },

  { anchorId: 'setting-aparencia-tema', sectionId: 'aparencia', label: 'Tema' },
  {
    anchorId: 'setting-aparencia-estilo-respiracao',
    sectionId: 'aparencia',
    label: 'Estilo de respiração',
  },
  { anchorId: 'setting-aparencia-contraste', sectionId: 'aparencia', label: 'Contraste' },
  { anchorId: 'setting-aparencia-densidade', sectionId: 'aparencia', label: 'Densidade' },
  {
    anchorId: 'setting-aparencia-tamanho-texto',
    sectionId: 'aparencia',
    label: 'Tamanho do texto',
  },

  { anchorId: 'setting-navegacao-menu-lateral', sectionId: 'navegacao', label: 'Menu lateral' },
  {
    anchorId: 'setting-navegacao-lembrar-estado',
    sectionId: 'navegacao',
    label: 'Lembrar estado do menu',
  },
  {
    anchorId: 'setting-navegacao-transicoes',
    sectionId: 'navegacao',
    label: 'Transições entre páginas',
  },

  { anchorId: 'setting-idioma-idioma', sectionId: 'idioma-e-regiao', label: 'Idioma' },
  { anchorId: 'setting-idioma-regiao', sectionId: 'idioma-e-regiao', label: 'Região' },
  {
    anchorId: 'setting-idioma-formato-data',
    sectionId: 'idioma-e-regiao',
    label: 'Formato de data',
  },
  {
    anchorId: 'setting-idioma-formato-horario',
    sectionId: 'idioma-e-regiao',
    label: 'Formato de horário',
  },
  {
    anchorId: 'setting-idioma-inicio-semana',
    sectionId: 'idioma-e-regiao',
    label: 'A semana começa em',
  },
  { anchorId: 'setting-idioma-fuso-horario', sectionId: 'idioma-e-regiao', label: 'Fuso horário' },

  { anchorId: 'setting-rotina-inicio-dia', sectionId: 'rotina', label: 'Início do dia' },
  { anchorId: 'setting-rotina-fim-dia', sectionId: 'rotina', label: 'Fim do dia' },
  { anchorId: 'setting-rotina-dias-semana', sectionId: 'rotina', label: 'Dias da semana' },
  { anchorId: 'setting-rotina-fim-semana', sectionId: 'rotina', label: 'Meu fim de semana' },
  { anchorId: 'setting-rotina-resumo-manha', sectionId: 'rotina', label: 'Resumo da manhã' },
  { anchorId: 'setting-rotina-revisao-noturna', sectionId: 'rotina', label: 'Revisão noturna' },
  { anchorId: 'setting-rotina-modo-foco', sectionId: 'rotina', label: 'Modo foco' },

  { anchorId: 'setting-notificacoes-master', sectionId: 'notificacoes', label: 'Notificações' },
  { anchorId: 'setting-notificacoes-no-app', sectionId: 'notificacoes', label: 'No aplicativo' },
  { anchorId: 'setting-notificacoes-push', sectionId: 'notificacoes', label: 'Push' },
  {
    anchorId: 'setting-notificacoes-email',
    sectionId: 'notificacoes',
    label: 'E-mail (notificações)',
  },
  {
    anchorId: 'setting-notificacoes-horario-silencioso',
    sectionId: 'notificacoes',
    label: 'Horário silencioso',
  },

  { anchorId: 'setting-sons-interface', sectionId: 'sons-e-feedback', label: 'Sons da interface' },
  { anchorId: 'setting-sons-conclusao', sectionId: 'sons-e-feedback', label: 'Som ao concluir' },
  { anchorId: 'setting-sons-haptico', sectionId: 'sons-e-feedback', label: 'Feedback tátil' },

  {
    anchorId: 'setting-acessibilidade-reduzir-movimento',
    sectionId: 'acessibilidade',
    label: 'Reduzir movimento',
  },
  {
    anchorId: 'setting-acessibilidade-alto-contraste',
    sectionId: 'acessibilidade',
    label: 'Alto contraste',
  },
  {
    anchorId: 'setting-acessibilidade-cores-assistidas',
    sectionId: 'acessibilidade',
    label: 'Cores assistidas',
  },
  {
    anchorId: 'setting-acessibilidade-sublinhar-links',
    sectionId: 'acessibilidade',
    label: 'Sublinhar links',
  },
  {
    anchorId: 'setting-acessibilidade-foco-reforcado',
    sectionId: 'acessibilidade',
    label: 'Foco reforçado',
  },
  {
    anchorId: 'setting-acessibilidade-tamanho-texto',
    sectionId: 'acessibilidade',
    label: 'Tamanho do texto (atalho)',
  },

  { anchorId: 'setting-privacidade-dados-uso', sectionId: 'privacidade', label: 'Dados de uso' },
  {
    anchorId: 'setting-privacidade-sugestoes',
    sectionId: 'privacidade',
    label: 'Usar minha atividade para personalizar sugestões',
  },

  { anchorId: 'setting-seguranca-senha', sectionId: 'seguranca', label: 'Senha' },
  {
    anchorId: 'setting-seguranca-2fa',
    sectionId: 'seguranca',
    label: 'Autenticação em duas etapas',
  },
  { anchorId: 'setting-seguranca-passkeys', sectionId: 'seguranca', label: 'Passkeys' },

  {
    anchorId: 'setting-sessoes-sair-todos',
    sectionId: 'sessoes-e-dispositivos',
    label: 'Sair de todos os dispositivos',
  },

  { anchorId: 'setting-dados-exportar', sectionId: 'dados', label: 'Exportar meus dados' },
  { anchorId: 'setting-dados-restaurar', sectionId: 'dados', label: 'Restaurar configurações' },

  {
    anchorId: 'setting-integracoes-google-calendar',
    sectionId: 'integracoes',
    label: 'Google Calendar',
  },

  { anchorId: 'setting-conta-perfil', sectionId: 'conta', label: 'Perfil' },
  { anchorId: 'setting-conta-email', sectionId: 'conta', label: 'E-mail (conta)' },
  { anchorId: 'setting-conta-excluir', sectionId: 'conta', label: 'Excluir conta' },
];
