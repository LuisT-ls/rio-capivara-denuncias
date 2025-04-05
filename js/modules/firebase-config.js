// Importação das funções necessárias do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'

// Configuração do Firebase (substitua com suas credenciais reais)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID'
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// Exporta os serviços para uso em outros módulos
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Função para verificar o estado de autenticação do usuário
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      user => {
        unsubscribe()
        resolve(user)
      },
      error => {
        reject(error)
      }
    )
  })
}

// Exporta também a instância do app
export default app
