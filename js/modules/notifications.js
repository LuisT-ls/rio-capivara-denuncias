// Container para notificações
let notificationContainer = null

// IDs para as notificações
let notificationIdCounter = 0

// Inicializar sistema de notificações
export function initNotifications() {
  notificationContainer = document.getElementById('notificacoes')

  if (!notificationContainer) {
    // Criar container de notificações se não existir
    notificationContainer = document.createElement('div')
    notificationContainer.id = 'notificacoes'
    notificationContainer.className =
      'notification-container position-fixed bottom-0 end-0 p-3'
    document.body.appendChild(notificationContainer)
  }
}

/**
 * Mostrar uma notificação
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms (padrão: 5000)
 */
export function showNotification(message, type = 'info', duration = 5000) {
  if (!notificationContainer) {
    initNotifications()
  }

  // Incrementar contador
  const notificationId = `notification-${++notificationIdCounter}`

  // Mapear tipo para classe de cor
  const typeClassMap = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning',
    info: 'bg-info text-dark'
  }

  // Mapear tipo para ícone
  const typeIconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }

  // Classe padrão se o tipo não for reconhecido
  const typeClass = typeClassMap[type] || typeClassMap.info
  const typeIcon = typeIconMap[type] || typeIconMap.info

  // Criar elemento de notificação
  const notification = document.createElement('div')
  notification.id = notificationId
  notification.className = `toast ${typeClass} mb-2`
  notification.setAttribute('role', 'alert')
  notification.setAttribute('aria-live', 'assertive')
  notification.setAttribute('aria-atomic', 'true')

  // Corpo da notificação
  notification.innerHTML = `
        <div class="toast-header ${typeClass}">
            <i class="fas ${typeIcon} me-2"></i>
            <strong class="me-auto">${
              type.charAt(0).toUpperCase() + type.slice(1)
            }</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `

  // Adicionar ao container
  notificationContainer.appendChild(notification)

  // Inicializar toast do Bootstrap
  const toast = new bootstrap.Toast(notification, {
    delay: duration,
    autohide: true
  })

  // Exibir notificação
  toast.show()

  // Remover do DOM depois de ocultar
  notification.addEventListener('hidden.bs.toast', () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  })

  return notificationId
}

/**
 * Remover uma notificação específica
 * @param {string} id - ID da notificação a ser removida
 */
export function removeNotification(id) {
  const notification = document.getElementById(id)
  if (notification) {
    const toast = bootstrap.Toast.getInstance(notification)
    if (toast) {
      toast.hide()
    }
  }
}

/**
 * Remover todas as notificações
 */
export function clearAllNotifications() {
  if (notificationContainer) {
    const notifications = notificationContainer.querySelectorAll('.toast')
    notifications.forEach(notification => {
      const toast = bootstrap.Toast.getInstance(notification)
      if (toast) {
        toast.hide()
      }
    })
  }
}
