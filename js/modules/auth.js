import { auth, getCurrentUser } from './firebase-config.js'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

import { showNotification } from './notifications.js'

// Estado do usuário atual
let currentUser = null

// Função para configurar os event listeners de autenticação
export function setupAuth() {
  // Verificar se o usuário já está autenticado
  getCurrentUser()
    .then(user => {
      updateAuthState(user)
    })
    .catch(error => {
      console.error('Erro ao verificar autenticação:', error)
    })

  // Configurar eventos para formulário de login
  const loginForm = document
    .getElementById('loginBtn')
    .closest('.modal')
    .querySelector('form')
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin)
  }

  // Botão de login com e-mail e senha
  const entrarBtn = document.getElementById('entrarBtn')
  if (entrarBtn) {
    entrarBtn.addEventListener('click', handleLogin)
  }

  // Botão de login com Google
  const googleLoginBtn = document.getElementById('googleLoginBtn')
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin)
  }

  // Botão de login com Facebook
  const facebookLoginBtn = document.getElementById('facebookLoginBtn')
  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', handleFacebookLogin)
  }

  // Botão de cadastro
  const cadastrarBtn = document.getElementById('cadastrarBtn')
  if (cadastrarBtn) {
    cadastrarBtn.addEventListener('click', handleRegister)
  }

  // Configurar evento de logout
  setupLogoutButton()
}

// Atualizar a interface baseado no estado de autenticação
function updateAuthState(user) {
  currentUser = user
  const loginBtn = document.getElementById('loginBtn')

  if (user) {
    // Usuário está logado
    console.log('Usuário autenticado:', user.displayName || user.email)

    if (loginBtn) {
      loginBtn.textContent = 'Minha Conta'
      loginBtn.classList.remove('btn-outline-success')
      loginBtn.classList.add('btn-success')

      // Alterar comportamento do botão para ir para página da conta
      loginBtn.removeEventListener('click', showLoginModal)
      loginBtn.addEventListener('click', showAccountPage)
    }

    // Adicionar botão de logout ao lado do botão de conta
    if (!document.getElementById('logoutBtn')) {
      const logoutBtn = document.createElement('button')
      logoutBtn.id = 'logoutBtn'
      logoutBtn.className = 'btn btn-outline-danger ms-2'
      logoutBtn.textContent = 'Sair'
      logoutBtn.addEventListener('click', handleLogout)

      loginBtn.parentNode.appendChild(logoutBtn)
    }

    // Fechar modal de login se estiver aberto
    const loginModal = bootstrap.Modal.getInstance(
      document.getElementById('loginModal')
    )
    if (loginModal) {
      loginModal.hide()
    }

    // Mostrar notificação
    showNotification(
      'Bem-vindo de volta, ' + (user.displayName || user.email) + '!',
      'success'
    )
  } else {
    // Usuário não está logado
    console.log('Usuário não autenticado')

    if (loginBtn) {
      loginBtn.textContent = 'Entrar'
      loginBtn.classList.remove('btn-success')
      loginBtn.classList.add('btn-outline-success')

      // Restaurar comportamento original do botão
      loginBtn.removeEventListener('click', showAccountPage)
      loginBtn.addEventListener('click', showLoginModal)
    }

    // Remover botão de logout se existir
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.parentNode.removeChild(logoutBtn)
    }
  }
}

// Função para lidar com o login via e-mail e senha
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('loginEmail').value
  const senha = document.getElementById('loginSenha').value

  if (!email || !senha) {
    showNotification('Por favor, preencha todos os campos', 'error')
    return
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha)
    updateAuthState(userCredential.user)
  } catch (error) {
    console.error('Erro ao fazer login:', error)

    // Mensagens de erro amigáveis
    let mensagemErro = 'Erro ao fazer login. Tente novamente.'

    if (error.code === 'auth/invalid-credential') {
      mensagemErro = 'E-mail ou senha incorretos. Verifique suas credenciais.'
    } else if (error.code === 'auth/user-not-found') {
      mensagemErro =
        'Usuário não encontrado. Verifique seu e-mail ou crie uma conta.'
    } else if (error.code === 'auth/wrong-password') {
      mensagemErro = 'Senha incorreta. Tente novamente.'
    } else if (error.code === 'auth/too-many-requests') {
      mensagemErro =
        'Muitas tentativas incorretas. Por favor, tente novamente mais tarde.'
    }

    showNotification(mensagemErro, 'error')
  }
}

// Login com Google
async function handleGoogleLogin() {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    updateAuthState(result.user)
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error)
    showNotification('Erro ao fazer login com Google', 'error')
  }
}

// Login com Facebook
async function handleFacebookLogin() {
  try {
    const provider = new FacebookAuthProvider()
    const result = await signInWithPopup(auth, provider)
    updateAuthState(result.user)
  } catch (error) {
    console.error('Erro ao fazer login com Facebook:', error)
    showNotification('Erro ao fazer login com Facebook', 'error')
  }
}

// Registro de novo usuário
async function handleRegister(e) {
  e.preventDefault()

  const nome = document.getElementById('cadastroNome').value
  const email = document.getElementById('cadastroEmail').value
  const senha = document.getElementById('cadastroSenha').value
  const confirmSenha = document.getElementById('confirmSenha').value
  const termos = document.getElementById('termos').checked

  // Validações
  if (!nome || !email || !senha || !confirmSenha) {
    showNotification('Por favor, preencha todos os campos', 'error')
    return
  }

  if (senha !== confirmSenha) {
    showNotification('As senhas não coincidem', 'error')
    return
  }

  if (!termos) {
    showNotification('Você precisa aceitar os termos de serviço', 'error')
    return
  }

  // Criar conta
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    )

    // Atualizar perfil do usuário com o nome
    await updateProfile(userCredential.user, {
      displayName: nome
    })

    updateAuthState(userCredential.user)

    // Fechar modal
    const cadastroModal = bootstrap.Modal.getInstance(
      document.getElementById('cadastroModal')
    )
    if (cadastroModal) {
      cadastroModal.hide()
    }

    showNotification('Conta criada com sucesso!', 'success')
  } catch (error) {
    console.error('Erro ao registrar:', error)

    // Mensagens de erro amigáveis
    let mensagemErro = 'Erro ao criar conta. Tente novamente.'

    if (error.code === 'auth/email-already-in-use') {
      mensagemErro = 'Este e-mail já está sendo usado por outra conta.'
    } else if (error.code === 'auth/invalid-email') {
      mensagemErro = 'E-mail inválido. Verifique o formato.'
    } else if (error.code === 'auth/weak-password') {
      mensagemErro = 'Senha muito fraca. Use pelo menos 6 caracteres.'
    }

    showNotification(mensagemErro, 'error')
  }
}

// Função para fazer logout
async function handleLogout() {
  try {
    await signOut(auth)
    updateAuthState(null)
    showNotification('Você saiu da sua conta', 'info')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    showNotification('Erro ao sair da conta', 'error')
  }
}

// Funções auxiliares para a UI
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'))
  loginModal.show()
}

function showAccountPage() {
  // Aqui você implementaria a navegação para a página de conta do usuário
  // Como ainda não temos essa página, podemos mostrar uma mensagem
  showNotification('Funcionalidade em desenvolvimento', 'info')
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }
}

// Exporta a função para obter o usuário atual
export function getUser() {
  return currentUser
}
