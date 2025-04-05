// Nome do cache para armazenamento
const CACHE_NAME = 'rio-capivara-denuncias-v1'

// Arquivos para serem cacheados inicialmente
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/modules/base/reset.css',
  '/assets/css/modules/base/variables.css',
  '/assets/css/modules/base/typography.css',
  '/assets/css/modules/components/buttons.css',
  '/assets/css/modules/components/inputs.css',
  '/assets/css/modules/layout/container.css',
  '/assets/css/modules/layout/header.css',
  '/assets/css/modules/layout/footer.css',
  '/assets/css/modules/utils/responsive.css',
  '/js/main.js',
  '/js/modules/app.js',
  '/js/modules/auth.js',
  '/js/modules/map.js',
  '/js/modules/denuncia-form.js',
  '/js/modules/dark-mode.js',
  '/js/modules/notifications.js',
  '/js/modules/firebase-config.js'
  // Adicione aqui outros assets que devem ser cacheados
]

// Instalar o Service Worker e cachear os arquivos iniciais
self.addEventListener('install', event => {
  console.log('Service Worker sendo instalado...')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto')
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  )
})

// Ativar o Service Worker e limpar caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker ativado')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Remover caches antigos que não correspondem ao atual
              return cacheName !== CACHE_NAME
            })
            .map(cacheName => {
              console.log('Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Interceptar requisições e servir do cache quando disponível
self.addEventListener('fetch', event => {
  // Ignorar requisições para APIs externas
  if (
    event.request.url.includes('firebaseio.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - retornar a resposta do cache
      if (response) {
        return response
      }

      // Clonar a requisição - porque ela só pode ser consumida uma vez
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then(response => {
          // Verificar se a resposta é válida
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          // Clonar a resposta - porque ela só pode ser consumida uma vez
          const responseToCache = response.clone()

          // Adicionar a nova resposta ao cache
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(error => {
          // Se falhar a busca online, tentar servir uma página offline
          console.error('Falha ao buscar recurso:', error)
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
    })
  )
})

// Ouvir por mensagens de outros contextos
self.addEventListener('message', event => {
  // Verificar se a mensagem é uma solicitação para limpar o cache
  if (event.data && event.data.action === 'clearCache') {
    console.log('Limpando cache por solicitação')

    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        // Responder que o cache foi limpo
        event.ports[0].postMessage({ result: 'Cache limpo com sucesso' })
      })
    )
  }
})

// Lidar com notificações push
self.addEventListener('push', event => {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body || 'Nova notificação do Rio Capivara Denúncias',
      icon: '/assets/img/favicon/android-chrome-192x192.png',
      badge: '/assets/img/favicon/badge-icon.png',
      data: {
        url: data.url || '/'
      }
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Rio Capivara Denúncias',
        options
      )
    )
  } catch (error) {
    console.error('Erro ao processar notificação push:', error)
  }
})

// Lidar com cliques em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const url = event.notification.data.url

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Verificar se já existe uma janela aberta e focar nela
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }

        // Caso contrário, abrir nova janela/aba
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})
