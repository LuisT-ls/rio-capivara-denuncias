import { db, storage } from './firebase-config.js'
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'
import { getUser } from './auth.js'
import { getCurrentLocation } from './map.js'
import { showNotification } from './notifications.js'

// Variáveis para controle do formulário
let fotoArquivo = null
let fotoPreview = null

// Configurar o formulário de denúncia
export function setupDenunciaForm() {
  const form = document.getElementById('denunciaForm')
  if (!form) return

  // Configurar campo de foto
  setupFotoUpload()

  // Configurar obtenção de localização
  setupLocalizacao()

  // Configurar envio do formulário
  form.addEventListener('submit', handleSubmitDenuncia)

  // Checkbox para denúncia anônima
  const anonimoCheckbox = document.getElementById('anonimo')
  const contatoFields = document.getElementById('contatoFields')

  if (anonimoCheckbox && contatoFields) {
    anonimoCheckbox.addEventListener('change', function () {
      if (this.checked) {
        contatoFields.classList.add('d-none')
      } else {
        contatoFields.classList.remove('d-none')
      }
    })
  }
}

// Configurar upload e preview de foto
function setupFotoUpload() {
  const tirarFotoBtn = document.getElementById('tirarFotoBtn')
  const uploadFotoBtn = document.getElementById('uploadFotoBtn')
  const fotoInput = document.getElementById('fotoInput')
  const previewContainer = document.getElementById('fotoPreview')
  const previewImg = previewContainer?.querySelector('img')
  const removerFotoBtn = document.getElementById('removerFotoBtn')

  // Referências para uso global na função
  fotoPreview = previewContainer

  // Botão para tirar foto (usando a câmera do dispositivo)
  if (tirarFotoBtn) {
    tirarFotoBtn.addEventListener('click', () => {
      // Verificar se o navegador suporta a API de câmera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Configurar o input para capturar da câmera
        fotoInput.setAttribute('capture', 'environment')
        fotoInput.click()
      } else {
        showNotification('Seu dispositivo não suporta acesso à câmera', 'error')
      }
    })
  }

  // Botão para upload de foto da galeria
  if (uploadFotoBtn) {
    uploadFotoBtn.addEventListener('click', () => {
      // Remover atributo de captura para permitir seleção da galeria
      fotoInput.removeAttribute('capture')
      fotoInput.click()
    })
  }

  // Processar a foto selecionada
  if (fotoInput) {
    fotoInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]

        // Verificar tipo de arquivo
        if (!file.type.match('image.*')) {
          showNotification('Por favor, selecione uma imagem válida', 'error')
          return
        }

        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showNotification('A imagem deve ser menor que 5MB', 'error')
          return
        }

        // Salvar referência ao arquivo
        fotoArquivo = file

        // Criar URL para preview
        const fileUrl = URL.createObjectURL(file)

        // Exibir preview
        if (previewImg && previewContainer) {
          previewImg.src = fileUrl
          previewContainer.classList.remove('d-none')
        }
      }
    })
  }

  // Botão para remover foto
  if (removerFotoBtn) {
    removerFotoBtn.addEventListener('click', () => {
      fotoArquivo = null

      if (fotoInput) {
        fotoInput.value = ''
      }

      if (previewContainer) {
        previewContainer.classList.add('d-none')
      }

      if (previewImg) {
        previewImg.src = ''
      }
    })
  }
}

// Configurar obtenção de localização
function setupLocalizacao() {
  const obterLocalizacaoBtn = document.getElementById('obterLocalizacaoBtn')

  if (obterLocalizacaoBtn) {
    obterLocalizacaoBtn.addEventListener('click', async () => {
      try {
        // Mostrar feedback visual
        obterLocalizacaoBtn.disabled = true
        obterLocalizacaoBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Obtendo...'

        // Obter localização atual
        const posicao = await getCurrentLocation()

        // Preencher campos de latitude e longitude
        document.getElementById('latitude').value = posicao.lat
        document.getElementById('longitude').value = posicao.lng

        // Mostrar informação ao usuário
        const localizacaoInfo = document.getElementById('localizacaoInfo')
        const localizacaoTexto = document.getElementById('localizacaoTexto')

        if (localizacaoInfo && localizacaoTexto) {
          localizacaoInfo.classList.remove('d-none')
          localizacaoTexto.textContent = `Localização atual: ${posicao.lat.toFixed(
            6
          )}, ${posicao.lng.toFixed(6)}`
        }

        showNotification('Localização capturada com sucesso!', 'success')
      } catch (error) {
        console.error('Erro ao obter localização:', error)
        showNotification(error.message || 'Erro ao obter localização', 'error')
      } finally {
        // Restaurar botão
        obterLocalizacaoBtn.disabled = false
        obterLocalizacaoBtn.innerHTML =
          '<i class="fas fa-map-marker-alt me-2"></i>Usar Minha Localização'
      }
    })
  }
}

// Lidar com o envio do formulário de denúncia
async function handleSubmitDenuncia(e) {
  e.preventDefault()

  // Obter elementos do formulário
  const tipoDenuncia = document.getElementById('tipoDenuncia')
  const descricao = document.getElementById('descricao')
  const latitude = document.getElementById('latitude')
  const longitude = document.getElementById('longitude')
  const anonimo = document.getElementById('anonimo')
  const email = document.getElementById('email')
  const submitBtn = e.target.querySelector('button[type="submit"]')

  // Validar campos obrigatórios
  if (!tipoDenuncia.value) {
    showNotification('Por favor, selecione o tipo de problema', 'warning')
    tipoDenuncia.focus()
    return
  }

  if (!descricao.value.trim()) {
    showNotification('Por favor, descreva o problema observado', 'warning')
    descricao.focus()
    return
  }

  if (!latitude.value || !longitude.value) {
    showNotification('Por favor, informe a localização da denúncia', 'warning')
    document.getElementById('obterLocalizacaoBtn').focus()
    return
  }

  // Se não for anônimo e tiver e-mail, validar formato
  if (!anonimo.checked && email.value && !validateEmail(email.value)) {
    showNotification('Por favor, informe um e-mail válido', 'warning')
    email.focus()
    return
  }

  try {
    // Desabilitar botão de envio e mostrar carregamento
    submitBtn.disabled = true
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...'

    // 1. Fazer upload da foto (se existir)
    let fotoUrl = null
    if (fotoArquivo) {
      fotoUrl = await uploadFoto(fotoArquivo)
    }

    // 2. Preparar objeto de denúncia
    const denuncia = {
      tipo: tipoDenuncia.value,
      descricao: descricao.value.trim(),
      localizacao: {
        latitude: parseFloat(latitude.value),
        longitude: parseFloat(longitude.value)
      },
      dataCriacao: serverTimestamp(),
      status: 'pendente', // Status inicial
      anonimo: anonimo.checked,
      email: !anonimo.checked && email.value ? email.value : null,
      fotoUrl: fotoUrl
    }

    // Adicionar ID do usuário se estiver logado
    const currentUser = getUser()
    if (currentUser && !anonimo.checked) {
      denuncia.usuarioId = currentUser.uid
      denuncia.usuarioNome = currentUser.displayName || null
    }

    // 3. Salvar no Firestore
    const docRef = await addDoc(collection(db, 'denuncias'), denuncia)

    // 4. Mostrar sucesso e limpar formulário
    showNotification('Denúncia enviada com sucesso!', 'success')
    resetForm(e.target)

    // 5. Redirecionar para a visualização da denúncia (ou outra página)
    setTimeout(() => {
      window.location.href = `#mapa`
      // Alternativa: Exibir modal de sucesso com mais detalhes
      mostrarModalSucesso(docRef.id)
    }, 1500)
  } catch (error) {
    console.error('Erro ao enviar denúncia:', error)
    showNotification('Erro ao enviar denúncia. Tente novamente.', 'error')
  } finally {
    // Restaurar botão de envio
    submitBtn.disabled = false
    submitBtn.textContent = 'Enviar Denúncia'
  }
}

// Fazer upload da foto
async function uploadFoto(file) {
  try {
    // Gerar nome único para o arquivo
    const timestamp = new Date().getTime()
    const fileName = `denuncias/${timestamp}_${file.name}`

    // Criar referência para o arquivo no Firebase Storage
    const storageRef = ref(storage, fileName)

    // Fazer upload
    const snapshot = await uploadBytes(storageRef, file)

    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error)
    throw new Error('Falha ao enviar a foto. Tente novamente.')
  }
}

// Resetar formulário
function resetForm(form) {
  form.reset()

  // Limpar foto preview
  if (fotoPreview) {
    fotoPreview.classList.add('d-none')
    const img = fotoPreview.querySelector('img')
    if (img) img.src = ''
  }

  // Limpar variável de arquivo
  fotoArquivo = null

  // Esconder info de localização
  const localizacaoInfo = document.getElementById('localizacaoInfo')
  if (localizacaoInfo) localizacaoInfo.classList.add('d-none')

  // Limpar campos ocultos
  document.getElementById('latitude').value = ''
  document.getElementById('longitude').value = ''

  // Mostrar campos de contato (caso estivessem ocultos)
  const contatoFields = document.getElementById('contatoFields')
  if (contatoFields) contatoFields.classList.remove('d-none')
}

// Validar formato de e-mail
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Mostrar modal de sucesso
function mostrarModalSucesso(denunciaId) {
  // Verificar se o modal já existe
  let modal = document.getElementById('sucessoModal')

  // Se não existir, criar
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'sucessoModal'
    modal.className = 'modal fade'
    modal.setAttribute('tabindex', '-1')
    modal.setAttribute('aria-hidden', 'true')

    // Criar conteúdo do modal
    modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Denúncia Enviada!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <i class="fas fa-check-circle text-success fa-4x"></i>
                        </div>
                        <p>Sua denúncia foi enviada com sucesso e será analisada por nossa equipe.</p>
                        <p>Identificador da denúncia: <strong>${denunciaId}</strong></p>
                        <p>Você pode acompanhar o status da sua denúncia pelo mapa ou pela sua conta.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <a href="#mapa" class="btn btn-primary" data-bs-dismiss="modal">Ver no Mapa</a>
                    </div>
                </div>
            </div>
        `

    // Adicionar ao corpo do documento
    document.body.appendChild(modal)
  }

  // Exibir o modal
  const sucessoModal = new bootstrap.Modal(modal)
  sucessoModal.show()
}
