/**
 * 🤖 WhatsApp Bot com Gemini Live Audio
 * Bot completo integrado com processamento de áudio nativo
 * Suporte a comandos /voz e /bot para controle
 */

import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { WhatsAppAudioAdapter, VOICES } from './adapters/whatsapp-adapter.js';

class WhatsAppGeminiBot {
  constructor() {
    this.client = null;
    this.audioAdapter = null;
    this.isActive = true;
    this.stats = {
      messagesProcessed: 0,
      audiosProcessed: 0,
      startTime: Date.now()
    };
    
    console.log('🤖 Inicializando WhatsApp Gemini Bot...');
  }

  /**
   * 🚀 INICIALIZAÇÃO COMPLETA
   */
  async initialize() {
    try {
      // Verifica variáveis de ambiente
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('🔑 GEMINI_API_KEY não encontrada nas variáveis de ambiente');
      }

      // Inicializa cliente WhatsApp
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      // Inicializa adaptador de áudio
      this.audioAdapter = new WhatsAppAudioAdapter(apiKey, VOICES.PUCK);
      
      // Configura eventos
      this.setupEventHandlers();
      
      // Inicia cliente
      await this.client.initialize();
      
      console.log('✅ WhatsApp Gemini Bot inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      process.exit(1);
    }
  }

  /**
   * 📱 CONFIGURAÇÃO DE EVENTOS WHATSAPP
   */
  setupEventHandlers() {
    // QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('📱 Escaneie o QR Code abaixo:');
      qrcode.generate(qr, { small: true });
    });

    // Bot autenticado
    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado com sucesso!');
    });

    // Bot pronto
    this.client.on('ready', () => {
      console.log('🚀 WhatsApp Bot está ONLINE!');
      console.log('🎤 Processamento de áudio Gemini Live: ATIVO');
    });

    // Processamento de mensagens
    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });

    // Erros
    this.client.on('auth_failure', () => {
      console.error('❌ Falha na autenticação WhatsApp');
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp desconectado:', reason);
    });
  }

  /**
   * 💬 PROCESSAMENTO DE MENSAGENS
   */
  async handleMessage(message) {
    try {
      this.stats.messagesProcessed++;
      
      // Ignora mensagens próprias
      if (message.fromMe) return;
      
      // Bot desativado
      if (!this.isActive) return;

      const messageBody = message.body?.toLowerCase() || '';
      
      console.log(`💬 Mensagem recebida: ${message.type} de ${message.from}`);

      // 🎤 PROCESSAMENTO DE ÁUDIO PTT
      if (message.type === 'ptt') {
        console.log('🎵 Processando áudio PTT...');
        
        const success = await this.audioAdapter.processWhatsAppAudio(message);
        if (success) {
          this.stats.audiosProcessed++;
        }
        return;
      }

      // 🤖 COMANDOS DO BOT
      if (messageBody.startsWith('/')) {
        await this.handleCommand(message, messageBody);
        return;
      }

      // 🗣️ MENSAGEM DE TEXTO NORMAL
      if (message.type === 'chat') {
        await message.reply(
          '🎤 Olá! Sou um bot de áudio.\n\n' +
          '🎤 **Envie um áudio** para conversar comigo!\n' +
          '📱 Use `/voz [nome]` para trocar a voz\n' +
          '🚀 Use `/status` para ver informações\n\n' +
          '🎭 Vozes: Puck, Kore, Aoede, Charon'
        );
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento da mensagem:', error);
    }
  }

  /**
   * ⚙️ COMANDOS DO BOT
   */
  async handleCommand(message, commandText) {
    const [command, ...args] = commandText.split(' ');
    
    switch (command) {
      case '/voz':
        await this.audioAdapter.handleVoiceCommand(message, args);
        break;
        
      case '/bot':
        await this.handleBotCommand(message, args);
        break;
        
      case '/status':
        await this.handleStatusCommand(message);
        break;
        
      case '/help':
      case '/ajuda':
        await this.handleHelpCommand(message);
        break;
        
      default:
        await message.reply('❌ Comando não reconhecido. Use `/help` para ver comandos disponíveis.');
    }
  }

  /**
   * 🤖 COMANDO /bot [on|off]
   */
  async handleBotCommand(message, args) {
    if (args.length === 0) {
      await message.reply(
        `🤖 **Status do Bot:** ${this.isActive ? 'ATIVO' : 'INATIVO'}\n\n` +
        `💡 Use:\n` +
        `• \`/bot on\` - Ativar\n` +
        `• \`/bot off\` - Desativar`
      );
      return;
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      this.isActive = true;
      await message.reply('✅ Bot **ATIVADO**! 🎤 Processamento de áudio habilitado.');
    } else if (action === 'off') {
      this.isActive = false;
      await message.reply('❌ Bot **DESATIVADO**. 🔇 Não processará mensagens até ser reativado.');
    } else {
      await message.reply('❌ Use `/bot on` ou `/bot off`');
    }
  }

  /**
   * 📊 COMANDO /status
   */
  async handleStatusCommand(message) {
    const systemStatus = await this.audioAdapter.getSystemStatus();
    const uptime = Math.round((Date.now() - this.stats.startTime) / 1000 / 60); // minutos
    
    const statusText = 
      `📊 **STATUS DO SISTEMA**\n\n` +
      `🤖 Bot: ${this.isActive ? '✅ ATIVO' : '❌ INATIVO'}\n` +
      `🎤 Voz atual: **${systemStatus.defaultVoice}**\n` +
      `🎆 Modelo: ${systemStatus.model}\n` +
      `🔗 Sessões ativas: ${systemStatus.activeSessions}\n\n` +
      `📊 **ESTATÍSTICAS:**\n` +
      `• Mensagens processadas: ${this.stats.messagesProcessed}\n` +
      `• Áudios processados: ${this.stats.audiosProcessed}\n` +
      `• Tempo online: ${uptime} min\n\n` +
      `🎭 **Vozes disponíveis:**\n` +
      systemStatus.availableVoices.map(v => `• ${v}`).join('\n');
    
    await message.reply(statusText);
  }

  /**
   * ❓ COMANDO /help
   */
  async handleHelpCommand(message) {
    const helpText = 
      `🎤 **WHATSAPP GEMINI BOT - AJUDA**\n\n` +
      `🎤 **COMO USAR:**\n` +
      `• Envie um áudio para conversar\n` +
      `• Receberá resposta em áudio nativo\n\n` +
      `⚙️ **COMANDOS:**\n` +
      `• \`/voz [nome]\` - Trocar voz da IA\n` +
      `• \`/bot [on|off]\` - Ativar/desativar bot\n` +
      `• \`/status\` - Ver status do sistema\n` +
      `• \`/help\` - Esta ajuda\n\n` +
      `🎭 **VOZES:**\n` +
      `• Puck (masculina jovem)\n` +
      `• Kore (feminina suave)\n` +
      `• Aoede (feminina expressiva)\n` +
      `• Charon (masculina profunda)\n\n` +
      `🚀 **Powered by Gemini Live API**`;
    
    await message.reply(helpText);
  }

  /**
   * 🛠️ CLEANUP E SHUTDOWN
   */
  async shutdown() {
    console.log('🛠️ Desligando bot...');
    
    if (this.audioAdapter) {
      this.audioAdapter.destroy();
    }
    
    if (this.client) {
      await this.client.destroy();
    }
    
    console.log('✅ Bot desligado com sucesso!');
    process.exit(0);
  }
}

// 📟 INICIALIZAÇÃO E CONTROLE DO PROCESSO
const bot = new WhatsAppGeminiBot();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛤️ Recebido SIGINT, desligando...');
  await bot.shutdown();
});

process.on('SIGTERM', async () => {
  console.log('\n🛤️ Recebido SIGTERM, desligando...');
  await bot.shutdown();
});

// Inicia o bot
bot.initialize().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

export default WhatsAppGeminiBot;