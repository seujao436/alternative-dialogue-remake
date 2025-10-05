# 🎙️ Alternative Dialogue Remake

**Sandbox Interativo de IA com Áudio Nativo** - Converse por voz com IA usando a API Gemini Live do Google de forma natural e em tempo real.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/seujao436/alternative-dialogue-remake)

## ✨ Novidades desta Versão

- 🔄 **Código totalmente reescrito** em React + TypeScript
- 🎨 **Interface moderna** com design responsivo
- ⚡ **Performance otimizada** com Vite
- 🔒 **Melhor segurança** no manuseio da API key
- 🎵 **5 vozes diferentes** da IA para escolher
- 📱 **Mobile-first** design responsivo
- 🔧 **Deploy automático** no Render

## 🚀 Deploy Rápido (1 Clique)

### Opção 1: Deploy Automático no Render

1. **Clique no botão "Deploy to Render" acima** ⬆️
2. **Conecte sua conta GitHub**
3. **Configure a variável de ambiente:**
   ```
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```
4. **Deploy automático!** ✨

### Opção 2: Fork + Deploy Manual

```bash
# 1. Fork este repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/alternative-dialogue-remake.git
cd alternative-dialogue-remake

# 3. Configure localmente (opcional)
npm install
cp .env.example .env.local
# Edite .env.local com sua VITE_GEMINI_API_KEY
npm run dev
```

## 🔑 Configuração da API Gemini

### 1. Obter Chave da API

- Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
- Clique em **"Create API Key"**
- Copie a chave gerada

### 2. Configurar no Render

- No painel do Render, vá em **Environment**
- Adicione: `VITE_GEMINI_API_KEY` = `sua_chave_aqui`
- **Save Changes**

### 3. Configurar Localmente (Desenvolvimento)

```bash
# Crie arquivo .env.local
echo "VITE_GEMINI_API_KEY=sua_chave_api_gemini" > .env.local
```

## 📋 Pré-requisitos

- **Conta GitHub** (gratuita)
- **Conta Render** (gratuita) - [render.com](https://render.com)
- **Chave API Gemini** (gratuita) - [Google AI Studio](https://aistudio.google.com)
- **Node.js 18+** (apenas para desenvolvimento local)

## 🎯 O Que Esta Aplicação Faz?

### 💬 Conversa por Voz Inteligente

- Fale naturalmente com a IA
- Respostas em tempo real por voz
- 5 vozes diferentes disponíveis
- Interface de chat moderna

### ⚙️ Funcionalidades Principais

- 🎤 **Gravação de áudio** em tempo real
- 🔊 **Reprodução de respostas** por voz
- 💬 **Chat textual** com histórico
- ⚙️ **Configurações** personalizáveis
- 🗑️ **Limpeza de chat** com um clique
- 📱 **Responsivo** para todos os dispositivos

### 🎵 Vozes Disponíveis

- **Puck** - Masculino Jovem (energética)
- **Charon** - Masculino Maduro (sábia)  
- **Kore** - Feminino Jovem (clara)
- **Fenrir** - Masculino Grave (profunda)
- **Aoede** - Feminino Melodioso (musical)

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seujao436/alternative-dialogue-remake.git
cd alternative-dialogue-remake

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua VITE_GEMINI_API_KEY

# Executar em desenvolvimento
npm run dev
```

### Comandos Úteis

```bash
npm run dev     # Desenvolvimento (localhost:5173)
npm run build   # Build de produção
npm run preview # Testar build localmente
npm run lint    # Verificar código
```

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **Build:** Vite 5
- **Styling:** CSS Modules + Custom Properties
- **IA:** Google Gemini Live API
- **Audio:** Web Audio API + MediaRecorder
- **Deploy:** Render (recomendado)

### Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── VoiceChat.tsx   # Controle de voz principal
│   └── Settings.tsx    # Modal de configurações
├── hooks/              # Custom hooks
├── types/              # TypeScript types
├── utils/              # Funções utilitárias
├── App.tsx            # Componente principal
├── App.css            # Estilos principais
├── main.tsx           # Entry point
└── index.css          # Estilos globais
```

## 🔒 Segurança e Privacidade

- ✅ **API Key** armazenada apenas localmente
- ✅ **Áudio** processado em tempo real (não armazenado)
- ✅ **Comunicação** criptografada via HTTPS/WSS
- ✅ **Sem coleta** de dados pessoais

## 🌐 Deploy e URLs

### Produção (Render)
- **App Principal**: `https://seu-app.onrender.com`

### Desenvolvimento
- **Local**: `http://localhost:5173`

## 📊 Monitoramento

### Render Dashboard
- **Build Logs**: Progresso do deploy
- **Application Logs**: Debug de runtime  
- **Metrics**: CPU, Memória, Requests

## 🚨 Troubleshooting

### ❌ Deploy falha no Render

```bash
# Verificar logs no Render Dashboard → Events → Build Logs

# Soluções comuns:
1. Verificar VITE_GEMINI_API_KEY configurada
2. Confirmar Node.js version (18+)
3. Verificar comandos de build corretos
```

### ❌ Aplicação não carrega

```bash
# Verificar:
1. URL está correta
2. VITE_GEMINI_API_KEY está configurada
3. Não há erros no console do navegador
```

### ❌ Microfone não funciona

```bash
# Soluções:
1. Usar HTTPS (obrigatório para microfone)
2. Permitir acesso ao microfone no navegador
3. Testar em navegadores diferentes (Chrome recomendado)
```

## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-feature`)
3. **Commite** (`git commit -m 'Adiciona nova feature'`)
4. **Push** (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### Desenvolvimento

```bash
# Setup do ambiente
git clone https://github.com/seujao436/alternative-dialogue-remake.git
cd alternative-dialogue-remake
npm install
npm run dev

# Executar lint
npm run lint

# Build local
npm run build
```

## 📄 Licença

Este projeto é licenciado sob **MIT License** - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Créditos

- **Google AI** - API Gemini Live
- **Render** - Plataforma de deploy  
- **React Team** - Framework
- **Vite** - Build tool moderno

## 🔗 Links Importantes

- 🌟 **[Live Demo](https://alternative-dialogue-remake.onrender.com)**
- 📚 **[Documentação Gemini](https://ai.google.dev/gemini-api/docs/live)**
- 🚀 **[Render Docs](https://render.com/docs)**
- 💬 **[Issues GitHub](https://github.com/seujao436/alternative-dialogue-remake/issues)**
- 📖 **[Projeto Original](https://github.com/seujao436/alternativedialogue)**

---

**🎉 Pronto para usar! Deploy em minutos, conversa por voz em tempo real! 🎙️✨**

💡 **Dica**: Após o deploy, teste primeiro a conexão e depois experimente diferentes vozes para personalizar sua experiência!