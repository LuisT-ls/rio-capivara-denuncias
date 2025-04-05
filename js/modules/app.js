import { showNotification } from './notifications.js'

// Versão da aplicação
export const APP_VERSION = '1.0.0'

// Função para inicializar a aplicação
export function initializeApp() {
  console.log('Inicializando a aplicação Rio Capivara Denúncias...')

  // Verificar suporte a recursos necessários
  checkBrowserSupport()

  // Adicionar classe específica de navegador para ajustes de CSS
  detectBrowserAndAddClass()

  // Configurar elementos interativos gerais
  setupGeneralInteractions()
}

// Verificar suporte do navegador para recursos principais
function checkBrowserSupport() {
  // Verificar suporte a Geolocalização
  if (!navigator.geolocation) {
    console.warn(
      'Este navegador não suporta Geolocalização. Algumas funcionalidades podem não funcionar corretamente.'
    )
  }

  // Verificar suporte a LocalStorage
  if (!window.localStorage) {
    console.warn(
      'Este navegador não suporta LocalStorage. As preferências não serão salvas.'
    )
  }

  // Verificar suporte a Service Worker (para PWA)
  if (!('serviceWorker' in navigator)) {
    console.warn(
      'Este navegador não suporta Service Workers. A funcionalidade offline não estará disponível.'
    )
  }

  // Verificar suporte a Câmera
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn(
      'Este navegador não suporta acesso à câmera. O upload de fotos será limitado.'
    )
  }
}

// Detectar navegador e adicionar classe para ajustes específicos de CSS
function detectBrowserAndAddClass() {
  const userAgent = navigator.userAgent.toLowerCase()
  let browserClass = ''

  // Detectar navegadores comuns
  if (userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg') > -1) {
    browserClass = 'browser-edge'
  } else if (
    userAgent.indexOf('chrome') > -1 &&
    userAgent.indexOf('safari') > -1
  ) {
    browserClass = 'browser-chrome'
  } else if (userAgent.indexOf('firefox') > -1) {
    browserClass = 'browser-firefox'
  } else if (
    userAgent.indexOf('safari') > -1 &&
    userAgent.indexOf('chrome') === -1
  ) {
    browserClass = 'browser-safari'
  } else if (
    userAgent.indexOf('msie') > -1 ||
    userAgent.indexOf('trident') > -1
  ) {
    browserClass = 'browser-ie'
    showNotification(
      'Seu navegador pode não ser totalmente compatível com esta aplicação. Recomendamos usar Chrome, Firefox, Edge ou Safari.',
      'warning',
      10000
    )
  }

  // Adicionar classe ao documento
  if (browserClass) {
    document.documentElement.classList.add(browserClass)
  }

  // Detectar dispositivo móvel
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    document.documentElement.classList.add('mobile-device')
  } else {
    document.documentElement.classList.add('desktop-device')
  }
}

// Configurar interações gerais da UI
function setupGeneralInteractions() {
  // Ativar todos os tooltips do Bootstrap
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  )
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Ativar popovers
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  )
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  })

  // Detectar se estamos offline
  window.addEventListener('offline', () => {
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar limitadas.',
      'warning'
    )
  })

  // Detectar quando voltamos online
  window.addEventListener('online', () => {
    showNotification('Você está online novamente!', 'success')
  })

  // Configurar links externos para abrir em nova aba
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    }
  })

  // Verificar se é a primeira visita e mostrar mensagem de boas-vindas
  const firstVisit = !localStorage.getItem('riocapivara_visited')
  if (firstVisit) {
    setTimeout(() => {
      showWelcomeMessage()
      localStorage.setItem('riocapivara_visited', 'true')
    }, 2000)
  }
}

// Mostrar mensagem de boas-vindas para novos usuários
function showWelcomeMessage() {
  const welcomeHtml = `
        <div class="modal fade" id="welcomeModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Bem-vindo ao Rio Capivara Denúncias</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <i class="fas fa-map-marked-alt fa-4x text-primary"></i>
                                <h5 class="mt-2">Mapeie Problemas</h5>
                                <p>Veja denúncias no mapa interativo e contribua com novas informações.</p>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <i class="fas fa-camera fa-4x text-primary"></i>
                                <h5 class="mt-2">Registre Evidências</h5>
                                <p>Faça upload de fotos e capture a localização exata do problema.</p>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <i class="fas fa-users fa-4x text-primary"></i>
                                <h5 class="mt-2">Mobilize a Comunidade</h5>
                                <p>Juntos podemos preservar o Rio Capivara e o meio ambiente local.</p>
                            </div>
                        </div>
                        <hr>
                        <p>Essa plataforma foi criada para permitir que a comunidade de Camaçari participe ativamente da proteção do Rio Capivara, denunciando problemas ambientais como desmatamento e despejo ilegal de resíduos.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <a href="#denunciar" class="btn btn-primary" data-bs-dismiss="modal">Fazer Minha Primeira Denúncia</a>
                    </div>
                </div>
            </div>
        </div>
    `

  // Adicionar modal ao documento
  const modalContainer = document.createElement('div')
  modalContainer.innerHTML = welcomeHtml
  document.body.appendChild(modalContainer.firstElementChild)

  // Exibir modal
  const welcomeModal = new bootstrap.Modal(
    document.getElementById('welcomeModal')
  )
  welcomeModal.show()
}

// Verificar atualizações da aplicação
export function checkForUpdates() {
  // Este é um exemplo simples - em produção, você implementaria
  // uma verificação real com seu backend ou service worker

  const lastVersion = localStorage.getItem('riocapivara_version')

  if (lastVersion && lastVersion !== APP_VERSION) {
    showNotification(
      `Nova versão disponível: ${APP_VERSION}. Atualize a página para obter as últimas melhorias.`,
      'info',
      10000
    )
  }

  // Salvar versão atual
  localStorage.setItem('riocapivara_version', APP_VERSION)
}
