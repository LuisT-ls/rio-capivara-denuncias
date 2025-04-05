import { db, obterDenuncias, obterDenunciasPorTipo } from './firebase-config.js'
import { showNotification } from './notifications.js'

// Variáveis globais para o mapa
let map = null
let selectionMap = null
let markers = []
let selectedLocation = null
let currentFilter = 'all'

// Inicializa o mapa principal
export function initMap() {
  const mapContainer = document.getElementById('mapContainer')
  if (!mapContainer) return

  // Coordenadas iniciais (centro de Camaçari, BA)
  const camacariBa = { lat: -12.6996, lng: -38.3263 }

  // Criar o mapa do Google Maps
  map = new google.maps.Map(mapContainer, {
    center: camacariBa,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    fullscreenControl: true,
    streetViewControl: true,
    zoomControl: true
  })

  // Carregar as denúncias do Firebase
  loadDenunciasFromFirebase()

  // Adicionar eventos para redimensionamento
  window.addEventListener('resize', () => {
    google.maps.event.trigger(map, 'resize')
  })

  // Expor a função de inicialização do mapa de seleção
  window.initSelectionMap = initSelectionMap
}

// Inicializa o mapa para seleção de localização na denúncia
export function initSelectionMap() {
  const selectionMapContainer = document.getElementById(
    'selecionarMapaContainer'
  )
  if (!selectionMapContainer) return

  // Coordenadas iniciais (mesmo do mapa principal)
  const camacariBa = { lat: -12.6996, lng: -38.3263 }

  // Criar o mapa para seleção
  selectionMap = new google.maps.Map(selectionMapContainer, {
    center: camacariBa,
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false
  })

  // Marcador para a localização selecionada
  let marker = null

  // Adicionar evento de clique para selecionar localização
  selectionMap.addListener('click', event => {
    // Remover marcador anterior, se existir
    if (marker) {
      marker.setMap(null)
    }

    // Adicionar novo marcador
    marker = new google.maps.Marker({
      position: event.latLng,
      map: selectionMap,
      animation: google.maps.Animation.DROP,
      draggable: true
    })

    // Armazenar a localização selecionada
    selectedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }

    // Permitir arrasto do marcador para ajuste fino
    marker.addListener('dragend', () => {
      selectedLocation = {
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
      }
    })
  })

  // Configurar botão de confirmação
  const confirmarBtn = document.getElementById('confirmarLocalizacaoBtn')
  if (confirmarBtn) {
    confirmarBtn.addEventListener('click', () => {
      if (selectedLocation) {
        // Preencher os campos ocultos
        document.getElementById('latitude').value = selectedLocation.lat
        document.getElementById('longitude').value = selectedLocation.lng

        // Mostrar info de localização
        const localizacaoInfo = document.getElementById('localizacaoInfo')
        const localizacaoTexto = document.getElementById('localizacaoTexto')

        if (localizacaoInfo && localizacaoTexto) {
          localizacaoInfo.classList.remove('d-none')
          localizacaoTexto.textContent = `Localização selecionada: ${selectedLocation.lat.toFixed(
            6
          )}, ${selectedLocation.lng.toFixed(6)}`
        }

        // Fechar o modal
        const mapaModal = bootstrap.Modal.getInstance(
          document.getElementById('mapaModal')
        )
        if (mapaModal) {
          mapaModal.hide()
        }

        showNotification('Localização selecionada com sucesso!', 'success')
      } else {
        showNotification(
          'Por favor, clique no mapa para selecionar uma localização',
          'warning'
        )
      }
    })
  }
}

// Configurar filtros de denúncias no mapa
export function setupMapFilters() {
  const filterButtons = document.querySelectorAll('[data-filter]')

  filterButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // Remover classe 'active' de todos os botões
      filterButtons.forEach(btn => btn.classList.remove('active'))

      // Adicionar classe 'active' ao botão clicado
      button.classList.add('active')

      // Atualizar filtro atual
      currentFilter = button.getAttribute('data-filter')

      // Carregar denúncias com o novo filtro
      await loadDenunciasFromFirebase()
    })
  })
}

// Função para carregar denúncias do Firestore
async function loadDenunciasFromFirebase() {
  if (!map) return

  try {
    // Mostrar indicador de carregamento
    showLoadingIndicator(true)

    // Limpar marcadores existentes
    clearMarkers()

    let denuncias = []

    // Buscar denúncias com base no filtro atual
    if (currentFilter === 'all') {
      denuncias = await obterDenuncias()
    } else {
      denuncias = await obterDenunciasPorTipo(currentFilter)
    }

    // Adicionar marcadores para cada denúncia
    denuncias.forEach(denuncia => {
      addDenunciaMarker(denuncia)
    })

    // Se não houver denúncias para mostrar
    if (denuncias.length === 0) {
      showNotification(
        `Nenhuma denúncia encontrada${
          currentFilter !== 'all'
            ? ` do tipo ${formatTipoDenuncia(currentFilter)}`
            : ''
        }.`,
        'info'
      )
    }
  } catch (error) {
    console.error('Erro ao carregar denúncias:', error)
    showNotification('Erro ao carregar denúncias do servidor', 'error')
  } finally {
    // Esconder indicador de carregamento
    showLoadingIndicator(false)
  }
}

// Mostrar/esconder indicador de carregamento
function showLoadingIndicator(show) {
  // Implementar um indicador de carregamento no mapa, se necessário
  // Por exemplo, adicionar/remover uma div com spinner
  const mapContainer = document.getElementById('mapContainer')

  if (!mapContainer) return

  let loadingIndicator = document.getElementById('mapLoadingIndicator')

  if (show) {
    if (!loadingIndicator) {
      loadingIndicator = document.createElement('div')
      loadingIndicator.id = 'mapLoadingIndicator'
      loadingIndicator.className =
        'position-absolute top-50 start-50 translate-middle bg-white p-3 rounded shadow'
      loadingIndicator.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Carregando denúncias...'
      mapContainer.appendChild(loadingIndicator)
    }
  } else {
    if (loadingIndicator) {
      loadingIndicator.remove()
    }
  }
}

// Adicionar marcador para uma denúncia
function addDenunciaMarker(denuncia) {
  if (!map || !denuncia.localizacao) return

  // Criar posição a partir dos dados
  const position = {
    lat: denuncia.localizacao.latitude,
    lng: denuncia.localizacao.longitude
  }

  // Definir ícone de acordo com o tipo de denúncia
  let icon = {
    url: './assets/img/markers/default-marker.png',
    scaledSize: new google.maps.Size(32, 32)
  }

  // Personalizar ícone por tipo
  switch (denuncia.tipo) {
    case 'desmatamento':
      icon.url = './assets/img/markers/tree-marker.png'
      break
    case 'despejo':
      icon.url = './assets/img/markers/waste-marker.png'
      break
    case 'poluicao':
      icon.url = './assets/img/markers/pollution-marker.png'
      break
  }

  // Criar marcador
  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title: `${denuncia.tipo}: ${denuncia.descricao.substring(0, 30)}...`,
    icon: icon,
    animation: google.maps.Animation.DROP
  })

  // Criar janela de informação (infowindow)
  const infoContent = `
        <div class="info-window">
            <h5 class="info-title">${formatTipoDenuncia(denuncia.tipo)}</h5>
            <p class="info-desc">${denuncia.descricao}</p>
            ${
              denuncia.fotoUrl
                ? `<img src="${denuncia.fotoUrl}" alt="Foto da denúncia" class="info-img img-fluid rounded mb-2" style="max-width: 100%; max-height: 150px;">`
                : ''
            }
            <p class="info-date">Reportado em: ${formatDate(
              denuncia.dataCriacao
            )}</p>
            <p class="info-status">Status: <span class="badge bg-${getStatusColor(
              denuncia.status
            )}">${formatStatus(denuncia.status)}</span></p>
            <a href="#denuncia-${
              denuncia.id
            }" class="btn btn-sm btn-primary">Ver Detalhes</a>
        </div>
    `

  const infoWindow = new google.maps.InfoWindow({
    content: infoContent,
    maxWidth: 300
  })

  // Adicionar evento de clique para abrir infowindow
  marker.addListener('click', () => {
    // Fechar qualquer infowindow aberta
    markers.forEach(m => {
      if (m.infoWindow && m.infoWindow.getMap()) {
        m.infoWindow.close()
      }
    })

    // Abrir esta infowindow
    infoWindow.open(map, marker)
  })

  // Guardar referência ao infowindow no marcador
  marker.infoWindow = infoWindow

  // Adicionar tipo de denúncia como propriedade para filtros
  marker.denunciaTipo = denuncia.tipo

  // Adicionar à lista de marcadores
  markers.push(marker)
}

// Limpar todos os marcadores
function clearMarkers() {
  markers.forEach(marker => marker.setMap(null))
  markers = []
}

// Função para formatar o tipo de denúncia
function formatTipoDenuncia(tipo) {
  const formatMap = {
    desmatamento: 'Desmatamento',
    despejo: 'Despejo Ilegal',
    poluicao: 'Poluição',
    outros: 'Outros'
  }

  return formatMap[tipo] || 'Denúncia'
}

// Função para formatar status
function formatStatus(status) {
  const formatMap = {
    pendente: 'Pendente',
    analise: 'Em Análise',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
    resolvida: 'Resolvida'
  }

  return formatMap[status] || 'Pendente'
}

// Função para obter cor do status
function getStatusColor(status) {
  const colorMap = {
    pendente: 'warning',
    analise: 'info',
    aprovada: 'primary',
    rejeitada: 'danger',
    resolvida: 'success'
  }

  return colorMap[status] || 'secondary'
}

// Função para formatar data
function formatDate(timestamp) {
  if (!timestamp) return 'Data desconhecida'

  // Se for um timestamp do Firestore
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    timestamp = timestamp.toDate()
  } else if (!(timestamp instanceof Date)) {
    // Se for um valor numérico ou string
    timestamp = new Date(timestamp)
  }

  // Formatação da data
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

// Função para usar localização atual do usuário
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada pelo seu navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      error => {
        let mensagemErro = 'Erro ao obter localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro = 'Você precisa permitir o acesso à sua localização'
            break
          case error.POSITION_UNAVAILABLE:
            mensagemErro = 'Informação de localização indisponível'
            break
          case error.TIMEOUT:
            mensagemErro = 'Tempo esgotado ao tentar obter localização'
            break
        }

        reject(new Error(mensagemErro))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

// Centralizar mapa em uma localização específica
export function centerMapOn(latitude, longitude, zoom = 16) {
  if (!map) return

  const position = { lat: latitude, lng: longitude }
  map.setCenter(position)
  map.setZoom(zoom)
}

// Recarregar as denúncias (útil para atualizar o mapa após uma nova denúncia)
export function reloadDenuncias() {
  loadDenunciasFromFirebase()
}
