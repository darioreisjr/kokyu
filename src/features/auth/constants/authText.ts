/**
 * pt-BR copy for the authentication feature. Centralized here so it's
 * the single place to touch when this app eventually adds i18n.
 */
export const authText = {
  login: {
    title: 'Bem-vindo de volta',
    description: 'Respire fundo e continue de onde parou.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    rememberMe: 'Lembrar de mim',
    forgotPassword: 'Esqueci minha senha',
    submit: 'Entrar',
    submitLoading: 'Entrando',
    dividerLabel: 'ou continue com',
    googleButton: 'Continuar com Google',
    noAccount: 'Ainda não tem uma conta?',
    createAccount: 'Criar conta',
    genericError: 'Não foi possível entrar. Tente novamente.',
  },
  loginVisual: {
    eyebrow: 'Kokyu',
    headline: 'Respire. Organize. Evolua.',
    body: 'Um único lugar para equilibrar trabalho, estudos, saúde e rotina — no seu ritmo.',
  },
  createAccount: {
    title: 'Crie sua conta',
    description: 'Comece a organizar sua rotina com o Kokyu.',
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
    usernameLabel: 'Username',
    birthDateLabel: 'Data de nascimento',
    passwordLabel: 'Senha',
    confirmPasswordLabel: 'Confirmar senha',
    submit: 'Criar conta',
    submitLoading: 'Criando conta',
    hasAccount: 'Já possui uma conta?',
    signIn: 'Entrar',
    successTitle: 'Conta criada com sucesso',
    successDescription: 'Seu perfil inicial está pronto.',
    genericError: 'Não foi possível criar sua conta. Tente novamente.',
    usernameUnavailableError: 'Este username já está em uso.',
  },
  createAccountVisual: {
    eyebrow: 'Kokyu',
    headline: 'Sua rotina começa com uma respiração.',
    body: 'Crie seu espaço e organize cada parte do seu dia.',
  },
  username: {
    checking: 'Verificando username...',
    available: 'Username disponível',
    unavailable: 'Este username já está em uso',
    error: 'Não foi possível verificar o username agora',
  },
  passwordRequirements: {
    length: '8 ou mais caracteres',
    uppercase: 'Uma letra maiúscula',
    lowercase: 'Uma letra minúscula',
    number: 'Um número',
    special: 'Um caractere especial',
  },
  passwordStrength: {
    label: 'Força da senha',
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte',
  },
  forgotPassword: {
    title: 'Recupere sua senha',
    description:
      'Informe o e-mail da sua conta e enviaremos as instruções para você criar uma nova senha.',
    emailLabel: 'E-mail',
    submit: 'Enviar instruções',
    submitLoading: 'Enviando',
    backToLogin: 'Voltar para entrar',
    genericError: 'Não foi possível solicitar a recuperação agora. Tente novamente.',
    successTitle: 'Verifique seu e-mail',
    successDescription:
      'Se existir uma conta associada a este endereço, você receberá as instruções para redefinir sua senha.',
    resend: 'Enviar novamente',
    resendLoading: 'Enviando',
    resendCooldown: (seconds: number) => `Enviar novamente em ${seconds}s`,
  },
  forgotPasswordVisual: {
    eyebrow: 'Kokyu',
    headline: 'Encontre novamente o seu ritmo.',
    body: 'Uma pequena pausa é suficiente para retomar sua respiração.',
  },
} as const;
