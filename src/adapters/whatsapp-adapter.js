/**
 * 💬 WhatsApp Bot Adapter - Gemini Live Audio
 * Integração completa para processar áudio PTT do WhatsApp
 * com resposta em áudio nativo via Gemini Live
 */

import { MessageMedia } from 'whatsapp-web.js';
import { GeminiLiveAudio, VOICES } from '../lib/gemini.js';

export class WhatsAppAudioAdapter {
  constructor(apiKey, defaultVoice = VOICES.PUCK) {
    this.geminiLive = new GeminiLiveAudio(apiKey);
    this.defaultVoice = defaultVoice;
    
    // Limpa sessões antigas a cada hora
    setInterval(() => {
      this.geminiLive.cleanOldSessions();
    }, 60 * 60 * 1000);
    
    console.log('🎤 WhatsApp Audio Adapter iniciado');
  }

  /**
   * 🔄 FLUXO COMPLETO WHATSAPP: PTT -> GEMINI -> VOICE NOTE
   */
  async processWhatsAppAudio(message, voiceName = null) {
    try {
      // 1. VALIDA se é PTT (Push-to-Talk)
      if (message.type !== 'ptt') {
        console.warn('⚠️ Mensagem não é um PTT de áudio');
        return null;
      }

      console.log('🎤 Processando áudio PTT do WhatsApp...');
      
      // 2. DOWNLOAD do áudio PTT
      const media = await message.downloadMedia();
      const audioBase64 = media.data;
      
      console.log('📥 Áudio baixado:', {
        mimetype: media.mimetype,
        size: Math.round(audioBase64.length / 1024) + 'KB'
      });

      // 3. CONVERTE Base64 para Blob
      const audioBlob = this.base64ToBlob(audioBase64, 'audio/wav');
      
      // 4. PROCESSA com Gemini Live
      const sessionId = this.getSessionId(message);
      const selectedVoice = voiceName || this.defaultVoice;
      
      const responseAudioBlob = await this.geminiLive.processAudio(
        sessionId, 
        audioBlob, 
        selectedVoice
      );
      
      if (!responseAudioBlob) {
        throw new Error('Nenhum áudio de resposta recebido');
      }

      // 5. CONVERTE resposta para formato WhatsApp
      const responseBase64 = await this.blobToBase64(responseAudioBlob);
      
      // 6. CRIA MessageMedia para WhatsApp
      const audioMedia = new MessageMedia(
        'audio/ogg; codecs=opus', // Formato otimizado para WhatsApp
        responseBase64,
        'response.ogg'
      );

      // 7. ENVIA como voice note
      await message.reply(audioMedia, undefined, {
        sendAudioAsVoice: true
      });
      
      console.log('✅ Áudio enviado como voice note!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro no processamento WhatsApp:', error);
      
      // Fallback: resposta em texto
      await message.reply('🎤 Desculpe, houve um erro ao processar o áudio. Tente novamente!');
      return false;
    }
  }

  /**
   * 🗣️ COMANDO DE VOZ: /voz [modelo]
   * Permite trocar a voz do bot
   */
  async handleVoiceCommand(message, args) {
    const availableVoices = Object.values(VOICES);
    
    if (args.length === 0) {
      const voiceList = availableVoices.map(v => `• ${v}`).join('\n');
      await message.reply(
        `🎭 **Vozes disponíveis:**\n${voiceList}\n\n` +
        `🔊 Voz atual: **${this.defaultVoice}**\n\n` +
        `💡 Use: \`/voz [nome]\` para trocar`
      );
      return;
    }

    const requestedVoice = args[0];
    const voiceKey = Object.keys(VOICES).find(key => 
      VOICES[key].toLowerCase() === requestedVoice.toLowerCase()
    );
    
    if (voiceKey) {
      this.defaultVoice = VOICES[voiceKey];
      await message.reply(
        `🎤 Voz alterada para: **${this.defaultVoice}**\n` +
        `📢 Próximos áudios usarão esta voz!`
      );
    } else {
      const voiceList = availableVoices.map(v => `• ${v}`).join('\n');
      await message.reply(
        `❌ Voz "${requestedVoice}" não encontrada.\n\n` +
        `🎭 **Vozes disponíveis:**\n${voiceList}`
      );
    }
  }

  /**
   * 📊 STATUS do sistema
   */
  async getSystemStatus() {
    const activeSessions = this.geminiLive.getActiveSessions();
    
    return {
      defaultVoice: this.defaultVoice,
      activeSessions: activeSessions.length,
      availableVoices: Object.values(VOICES),
      model: 'gemini-2.0-flash-exp'
    };
  }

  /**
   * 🛠️ UTILITÁRIOS PRIVADOS
   */
  
  // Gera ID único por chat/usuário
  getSessionId(message) {
    return `whatsapp_${message.from.replace('@c.us', '')}_${message.author || 'group'}`;
  }
  
  // Base64 para Blob
  base64ToBlob(base64, mimeType = 'audio/wav') {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
  
  // Blob para Base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Cleanup ao destruir
  destroy() {
    // Remove todas as sessões
    const sessions = this.geminiLive.getActiveSessions();
    sessions.forEach(sessionId => {
      this.geminiLive.destroySession(sessionId);
    });
    
    console.log('🧹 WhatsApp Adapter destruído');
  }
}

export default WhatsAppAudioAdapter;