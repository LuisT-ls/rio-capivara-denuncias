// Importações de módulos
import { initializeApp } from './modules/app.js'
import { setupAuth } from './modules/auth.js'
import { initMap, setupMapFilters } from './modules/map.js'
import { setupDenunciaForm } from './modules/denuncia-form.js'
import { setupDarkMode } from './modules/dark-mode.js'
import { initNotifications } from './modules/notifications.js'

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando aplicação Rio Capivara Denúncias...')

  // Inicializar a aplicação
  initializeApp()

  // Configurar autenticação
  setupAuth()

  // Configurar mapa (será chamado pelo callback da API do Google Maps)
  window.initMap = initMap

  // Configurar filtros do mapa
  setupMapFilters()

  // Configurar formulário de denúncia
  setupDenunciaForm()

  // Configurar modo escuro
  setupDarkMode()

  // Inicializar sistema de notificações
  initNotifications()

  // Configurar navegação suave (smooth scroll)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      const targetId = this.getAttribute('href')
      if (targetId === '#') return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })

  // Configurar modais
  setupModals()
})

// Configuração de modais
function setupModals() {
  // Link de cadastro no modal de login
  document.getElementById('cadastroLink')?.addEventListener('click', e => {
    e.preventDefault()

    // Fechar modal de login
    const loginModal = bootstrap.Modal.getInstance(
      document.getElementById('loginModal')
    )
    loginModal.hide()

    // Abrir modal de cadastro
    const cadastroModal = new bootstrap.Modal(
      document.getElementById('cadastroModal')
    )
    cadastroModal.show()
  })

  // Botão de login no cabeçalho
  document.getElementById('loginBtn')?.addEventListener('click', () => {
    const loginModal = new bootstrap.Modal(
      document.getElementById('loginModal')
    )
    loginModal.show()
  })

  // Alternar checkbox de denúncia anônima
  document.getElementById('anonimo')?.addEventListener('change', function () {
    const contatoFields = document.getElementById('contatoFields')
    if (this.checked) {
      contatoFields.classList.add('d-none')
    } else {
      contatoFields.classList.remove('d-none')
    }
  })

  // Botão para selecionar localização no mapa
  document
    .getElementById('selecionarNoMapaBtn')
    ?.addEventListener('click', () => {
      const mapaModal = new bootstrap.Modal(
        document.getElementById('mapaModal')
      )
      mapaModal.show()

      // Inicializar o mapa de seleção após o modal ser aberto
      document.getElementById('mapaModal').addEventListener(
        'shown.bs.modal',
        () => {
          window.initSelectionMap() // Função que será definida no módulo map.js
        },
        { once: true }
      )
    })
}
