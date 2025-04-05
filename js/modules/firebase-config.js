// Importação das funções necessárias do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js'

// Substitua estas configurações pelas fornecidas pelo Firebase Console
const firebaseConfig = {
  apiKey: 'AIzaSyCYnKGstZwpDHM7edfHWLFoDuD_wRoDOpU',
  authDomain: 'rio-capivara-denuncias.firebaseapp.com',
  projectId: 'rio-capivara-denuncias',
  storageBucket: 'rio-capivara-denuncias.firebasestorage.app',
  messagingSenderId: '805036098849',
  appId: '1:805036098849:web:11e94ef3bbff760f646a60',
  measurementId: 'G-EWNHMG7F0Q'
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// Inicializa os serviços
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

// Provedores de autenticação
export const googleProvider = new GoogleAuthProvider()

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

// Funções de Autenticação

// Registrar novo usuário
export async function registerUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Atualizar o perfil com o nome
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      })
    }

    // Criar documento do usuário no Firestore
    await addDoc(collection(db, 'usuarios'), {
      uid: userCredential.user.uid,
      email: email,
      nome: displayName || '',
      dataCadastro: serverTimestamp(),
      tipo: 'usuario' // Pode ser 'usuario', 'admin', etc.
    })

    return userCredential.user
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    throw error
  }
}

// Login com email e senha
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return userCredential.user
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }
}

// Login com Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)

    // Verificar se o usuário já existe no Firestore
    const usuariosRef = collection(db, 'usuarios')
    const q = query(usuariosRef, where('uid', '==', result.user.uid))
    const querySnapshot = await getDocs(q)

    // Se não existir, criar documento para o usuário
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'usuarios'), {
        uid: result.user.uid,
        email: result.user.email,
        nome: result.user.displayName || '',
        dataCadastro: serverTimestamp(),
        tipo: 'usuario'
      })
    }

    return result.user
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error)
    throw error
  }
}

// Login com Facebook
export async function loginWithFacebook() {
  try {
    const result = await signInWithPopup(auth, facebookProvider)

    // Similar ao Google, verificar e criar documento se necessário
    const usuariosRef = collection(db, 'usuarios')
    const q = query(usuariosRef, where('uid', '==', result.user.uid))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      await addDoc(collection(db, 'usuarios'), {
        uid: result.user.uid,
        email: result.user.email,
        nome: result.user.displayName || '',
        dataCadastro: serverTimestamp(),
        tipo: 'usuario'
      })
    }

    return result.user
  } catch (error) {
    console.error('Erro ao fazer login com Facebook:', error)
    throw error
  }
}

// Logout
export async function logoutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }
}

// Funções do Firestore

// Criar uma denúncia
export async function criarDenuncia(denunciaData) {
  try {
    const docRef = await addDoc(collection(db, 'denuncias'), {
      ...denunciaData,
      dataCriacao: serverTimestamp(),
      dataAtualizacao: serverTimestamp(),
      status: 'pendente'
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar denúncia:', error)
    throw error
  }
}

// Obter todas as denúncias
export async function obterDenuncias() {
  try {
    const querySnapshot = await getDocs(collection(db, 'denuncias'))

    const denuncias = []
    querySnapshot.forEach(doc => {
      denuncias.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return denuncias
  } catch (error) {
    console.error('Erro ao obter denúncias:', error)
    throw error
  }
}

// Obter denúncias por tipo
export async function obterDenunciasPorTipo(tipo) {
  try {
    const q = query(collection(db, 'denuncias'), where('tipo', '==', tipo))
    const querySnapshot = await getDocs(q)

    const denuncias = []
    querySnapshot.forEach(doc => {
      denuncias.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return denuncias
  } catch (error) {
    console.error(`Erro ao obter denúncias do tipo ${tipo}:`, error)
    throw error
  }
}

// Funções do Storage

// Upload de imagem
export async function uploadImagem(file, path) {
  try {
    const timestamp = new Date().getTime()
    const fileName = `${path}/${timestamp}_${file.name}`

    const storageRef = ref(storage, fileName)
    const snapshot = await uploadBytes(storageRef, file)

    // Retorna a URL da imagem
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error)
    throw error
  }
}

// Excluir imagem
export async function excluirImagem(url) {
  try {
    // Extrair o caminho da URL
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Erro ao excluir imagem:', error)
    throw error
  }
}

// Exporta também a instância do app
export default app
