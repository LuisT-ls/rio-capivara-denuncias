// Chave para armazenar preferência no localStorage
const DARKMODE_KEY = 'riocapivara_darkmode'

// Inicializar e configurar modo escuro
export function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle')

  if (!darkModeToggle) return

  // Carregar preferência salva
  const isDarkMode = localStorage.getItem(DARKMODE_KEY) === 'true'

  // Aplicar modo escuro se necessário
  if (isDarkMode) {
    enableDarkMode()
  }

  // Configurar evento de clique
  darkModeToggle.addEventListener('click', toggleDarkMode)

  // Atualizar ícone do botão
  updateDarkModeButton(isDarkMode)
}

// Alternar entre modo claro e escuro
function toggleDarkMode() {
  // Verificar estado atual
  const isDarkMode = document.body.classList.contains('dark-mode')

  // Alternar modo
  if (isDarkMode) {
    disableDarkMode()
  } else {
    enableDarkMode()
  }
}

// Ativar modo escuro
function enableDarkMode() {
  document.body.classList.add('dark-mode')
  localStorage.setItem(DARKMODE_KEY, 'true')
  updateDarkModeButton(true)
}

// Desativar modo escuro
function disableDarkMode() {
  document.body.classList.remove('dark-mode')
  localStorage.setItem(DARKMODE_KEY, 'false')
  updateDarkModeButton(false)
}

// Atualizar aparência do botão
function updateDarkModeButton(isDarkMode) {
  const button = document.getElementById('darkModeToggle')
  if (!button) return

  const icon = button.querySelector('i')

  if (isDarkMode) {
    button.setAttribute('aria-label', 'Mudar para modo claro')
    button.classList.add('btn-dark')
    button.classList.remove('btn-light')

    if (icon) {
      icon.classList.remove('fa-moon')
      icon.classList.add('fa-sun')
    }
  } else {
    button.setAttribute('aria-label', 'Mudar para modo escuro')
    button.classList.add('btn-light')
    button.classList.remove('btn-dark')

    if (icon) {
      icon.classList.remove('fa-sun')
      icon.classList.add('fa-moon')
    }
  }
}
