/**
 * 🌐 Servidor Web API - Gemini Live Audio
 * Express server com endpoint /process-audio para a interface web
 * Integração com GeminiLiveAudio class
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiLiveAudio, VOICES } from './lib/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GeminiWebServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.geminiLive = null;
    
    this.setupServer();
    console.log('🌐 Servidor Web Gemini Live inicializando...');
  }

  /**
   * ⚙️ CONFIGURAÇÃO DO SERVIDOR
   */
  setupServer() {
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
    
    // Configuração do Multer para upload de áudio
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de áudio são permitidos'));
        }
      }
    });

    // Inicializa Gemini Live
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY não encontrada nas variáveis de ambiente');
      process.exit(1);
    }
    
    this.geminiLive = new GeminiLiveAudio(apiKey);
    
    // Limpeza periódica de sessões
    setInterval(() => {
      this.geminiLive.cleanOldSessions();
    }, 15 * 60 * 1000); // 15 minutos

    // Rotas
    this.setupRoutes(upload);
  }

  /**
   * 🛸️ CONFIGURAÇÃO DAS ROTAS
   */
  setupRoutes(upload) {
    // Página principal
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // 🎤 API: PROCESSAMENTO DE ÁUDIO
    this.app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
      try {
        console.log('🎤 Recebida requisição de processamento de áudio...');
        
        // Validação
        if (!req.file) {
          return res.status(400).json({ error: 'Nenhum arquivo de áudio enviado' });
        }
        
        const voiceName = req.body.voice || VOICES.PUCK;
        const sessionId = `web_${req.ip}_${Date.now()}`;
        
        console.log('Processando áudio:', {
          size: req.file.size,
          mimetype: req.file.mimetype,
          voice: voiceName,
          sessionId
        });
        
        // Converte buffer para Blob
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        
        // Processa com Gemini Live
        const responseAudioBlob = await this.geminiLive.processAudio(
          sessionId,
          audioBlob,
          voiceName
        );
        
        if (!responseAudioBlob) {
          throw new Error('Nenhuma resposta de áudio recebida do Gemini');
        }
        
        // Converte Blob para Buffer
        const responseBuffer = Buffer.from(await responseAudioBlob.arrayBuffer());
        
        // Retorna áudio como resposta
        res.set({
          'Content-Type': 'audio/pcm',
          'Content-Length': responseBuffer.length
        });
        
        res.send(responseBuffer);
        
        console.log('✅ Áudio processado e enviado com sucesso!');
        
      } catch (error) {
        console.error('❌ Erro no processamento de áudio:', error);
        res.status(500).json({ 
          error: 'Erro interno do servidor',
          message: error.message 
        });
      }
    });

    // 📊 API: STATUS DO SISTEMA
    this.app.get('/api/status', async (req, res) => {
      try {
        const activeSessions = this.geminiLive.getActiveSessions();
        
        res.json({
          status: 'online',
          model: 'gemini-2.0-flash-exp',
          activeSessions: activeSessions.length,
          availableVoices: Object.values(VOICES),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 🎭 API: LISTAR VOZES
    this.app.get('/api/voices', (req, res) => {
      res.json({
        voices: Object.entries(VOICES).map(([key, name]) => ({
          key: key.toLowerCase(),
          name,
          description: this.getVoiceDescription(name)
        }))
      });
    });

    // 🧪 API: HEALTH CHECK
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Gemini Live Audio Server'
      });
    });

    // 🛠️ API: LIMPAR SESSÕES
    this.app.post('/api/cleanup', (req, res) => {
      try {
        this.geminiLive.cleanOldSessions();
        const activeSessions = this.geminiLive.getActiveSessions();
        
        res.json({
          message: 'Limpeza executada com sucesso',
          activeSessions: activeSessions.length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404 Handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint não encontrado' });
    });

    // Error Handler
    this.app.use((error, req, res, next) => {
      console.error('❌ Erro no servidor:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message 
      });
    });
  }

  /**
   * 🎭 DESCRIÇÕES DAS VOZES
   */
  getVoiceDescription(voiceName) {
    const descriptions = {
      [VOICES.PUCK]: 'Masculina jovem e animada',
      [VOICES.KORE]: 'Feminina suave e acolhedora',
      [VOICES.AOEDE]: 'Feminina expressiva e artística',
      [VOICES.CHARON]: 'Masculina profunda e séria'
    };
    
    return descriptions[voiceName] || 'Voz personalizada';
  }

  /**
   * 🚀 INICIALIZAR SERVIDOR
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🌐 Servidor rodando em http://localhost:${this.port}`);
      console.log(`🎤 Gemini Live API: ATIVO`);
      console.log(`🎭 Vozes disponíveis: ${Object.values(VOICES).join(', ')}`);
      console.log(`🔑 API Key configurada: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
    });
  }

  /**
   * 🛠️ PARAR SERVIDOR
   */
  stop() {
    console.log('🛠️ Parando servidor...');
    
    // Limpa todas as sessões
    const sessions = this.geminiLive.getActiveSessions();
    sessions.forEach(sessionId => {
      this.geminiLive.destroySession(sessionId);
    });
    
    console.log('✅ Servidor parado com sucesso!');
    process.exit(0);
  }
}

// 📄 INICIALIZAÇÃO
const server = new GeminiWebServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛤️ Recebido SIGINT, parando servidor...');
  server.stop();
});

process.on('SIGTERM', () => {
  console.log('\n🛤️ Recebido SIGTERM, parando servidor...');
  server.stop();
});

// Inicia o servidor
server.start();

export default GeminiWebServer;