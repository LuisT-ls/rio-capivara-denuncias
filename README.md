# Rio Capivara Denúncias

Aplicação web para denúncias ambientais no Rio Capivara (Camaçari-BA).

## 📋 Sobre o Projeto

Esta aplicação permite o registro fotográfico e georreferenciado de situações de risco ambiental, como despejo ilegal e desmatamento na região do Rio Capivara em Camaçari, Bahia. O objetivo é promover o monitoramento ambiental e o engajamento da comunidade local na preservação deste importante ecossistema.

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5, CSS3, JavaScript
- React.js
- Bootstrap

### Backend
- Node.js com Express.js
- Firebase (Banco de dados e autenticação)
- Cloudinary (Armazenamento de imagens)

### Geolocalização e Mapas
- Google Maps API
- Geolocation API

### Segurança
- Firebase Auth
- reCAPTCHA v3

### Hospedagem
- Vercel (Frontend)
- Railway/Render (Backend)
- Google Analytics (Monitoramento)

## ⚙️ Funcionalidades Principais

1. **Registro de denúncias**
   - Captura ou upload de fotos
   - Geolocalização automática
   - Campo para descrição do problema

2. **Mapa interativo**
   - Visualização de denúncias em tempo real
   - Filtros por categoria de problema

3. **Autenticação flexível**
   - Opção para denúncias anônimas
   - Cadastro para acompanhamento de denúncias

4. **Painel administrativo**
   - Moderação de conteúdo
   - Estatísticas e relatórios

5. **Sistema de notificações**
   - Alertas para áreas de risco
   - Atualizações sobre denúncias

6. **Integração institucional**
   - Geração de relatórios para órgãos ambientais e prefeitura

## 🚀 Como Iniciar o Desenvolvimento

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase
- Conta no Cloudinary (para armazenamento de imagens)
- Chave da API do Google Maps

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/LuisT-ls/rio-capivara-denuncias
   ```

2. Instale as dependências
   ```bash
   cd rio-capivara-denuncias
   npm install
   ```

3. Configure as variáveis de ambiente (crie um arquivo .env na raiz do projeto)
   ```
   REACT_APP_FIREBASE_API_KEY=sua-chave
   REACT_APP_FIREBASE_AUTH_DOMAIN=seu-dominio
   REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=seu-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
   REACT_APP_FIREBASE_APP_ID=seu-app-id
   REACT_APP_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
   REACT_APP_CLOUDINARY_CLOUD_NAME=seu-cloud-name
   REACT_APP_CLOUDINARY_API_KEY=sua-api-key
   REACT_APP_CLOUDINARY_API_SECRET=seu-api-secret
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm start
   ```

## 📊 Desenvolvimento Futuro

- Versão mobile como Progressive Web App (PWA)
- Parcerias com ONGs e órgãos ambientais
- Gamificação para incentivo à participação
- Implementação de IA para análise de padrões de risco

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Contato

Para mais informações sobre o projeto, entre em contato através de [luisteixeira@ufba.br].