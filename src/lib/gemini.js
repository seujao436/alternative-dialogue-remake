/**
 * 🎤 Gemini Live API - Lógica Completa de Áudio
 * Baseado na especificação do Alternative Dialogue original
 * Modelo: gemini-2.0-flash-exp
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// 📋 CONFIGURAÇÕES
const MODEL = "models/gemini-2.0-flash-exp";

// 🎭 VOZES DISPONÍVEIS
export const VOICES = {
  PUCK: "Puck",     // Masculina jovem
  KORE: "Kore",     // Feminina suave  
  AOEDE: "Aoede",   // Feminina expressiva
  CHARON: "Charon"  // Masculina profunda
};

// 🎯 CONFIGURAÇÃO DO LIVE SESSION
const getAudioConfig = (voiceName = VOICES.PUCK) => ({
  generationConfig: {
    responseModalities: "audio", // ✅ Resposta direta em áudio
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName
        }
      }
    }
  }
});

/**
 * 🔧 Classe principal para gerenciar sessões Gemini Live
 */
export class GeminiLiveAudio {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: MODEL });
    this.liveSessions = new Map();
  }

  /**
   * 🎤 1. INICIALIZAÇÃO DA SESSÃO LIVE
   */
  async createLiveSession(sessionId, voiceName = VOICES.PUCK) {
    try {
      const session = await this.model.startChat(getAudioConfig(voiceName));
      this.liveSessions.set(sessionId, {
        session,
        voiceName,
        createdAt: Date.now()
      });
      
      console.log(`✅ Sessão Live criada: ${sessionId} com voz ${voiceName}`);
      return session;
    } catch (error) {
      console.error('❌ Erro ao criar sessão Live:', error);
      throw error;
    }
  }

  /**
   * 🎵 2. ENVIO DE ÁUDIO (INPUT)
   */
  async sendAudio(sessionId, audioBlob) {
    try {
      const sessionData = this.liveSessions.get(sessionId);
      if (!sessionData) {
        throw new Error(`Sessão ${sessionId} não encontrada`);
      }

      // Converte blob para base64
      const audioBase64 = await this.blobToBase64(audioBlob);

      console.log(`🎤 Enviando áudio para sessão ${sessionId}...`);
      
      // Envia áudio para Gemini Live
      const result = await sessionData.session.sendMessage([
        {
          inlineData: {
            mimeType: audioBlob.type, // "audio/webm" or "audio/wav"
            data: audioBase64
          }
        }
      ]);

      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar áudio:', error);
      throw error;
    }
  }

  /**
   * 🔊 3. RECEBIMENTO DE ÁUDIO (OUTPUT)
   */
  async receiveAudioResponse(result) {
    try {
      const response = await result.response;

      // Procura parte com áudio
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
            console.log('✅ ÁUDIO ENCONTRADO!', {
              mimeType: part.inlineData.mimeType,
              dataLength: part.inlineData.data.length
            });

            const audioBase64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType; // "audio/pcm" geralmente

            // Converte base64 para blob
            const audioBlob = this.base64ToBlob(audioBase64, mimeType);
            return audioBlob;
          }
        }
      }

      console.warn('⚠️ Nenhum áudio encontrado na resposta');
      return null;
    } catch (error) {
      console.error('❌ Erro ao processar resposta de áudio:', error);
      throw error;
    }
  }

  /**
   * 🔄 FLUXO COMPLETO: Áudio para Áudio
   */
  async processAudio(sessionId, inputAudioBlob, voiceName) {
    try {
      // Cria sessão se não existir
      if (!this.liveSessions.has(sessionId)) {
        await this.createLiveSession(sessionId, voiceName);
      }

      // 1. Envia áudio
      const result = await this.sendAudio(sessionId, inputAudioBlob);
      
      // 2. Recebe resposta em áudio
      const responseAudioBlob = await this.receiveAudioResponse(result);
      
      return responseAudioBlob;
    } catch (error) {
      console.error('❌ Erro no processamento completo:', error);
      throw error;
    }
  }

  /**
   * 🧹 UTILITÁRIOS
   */
  
  // Converte Blob para Base64
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

  // Converte Base64 para Blob
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Remove sessão
  destroySession(sessionId) {
    this.liveSessions.delete(sessionId);
    console.log(`🗑️ Sessão ${sessionId} removida`);
  }

  // Lista sessões ativas
  getActiveSessions() {
    return Array.from(this.liveSessions.keys());
  }

  // Limpa sessões antigas (mais de 30 minutos)
  cleanOldSessions() {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    for (const [sessionId, sessionData] of this.liveSessions.entries()) {
      if (now - sessionData.createdAt > THIRTY_MINUTES) {
        this.destroySession(sessionId);
      }
    }
  }
}

/**
 * 🎯 EXPORTAÇÕES CONVENIENTES
 */

// Instância singleton (opcional)
let globalInstance = null;

export const createGeminiLive = (apiKey) => {
  return new GeminiLiveAudio(apiKey);
};

export const getGlobalInstance = (apiKey) => {
  if (!globalInstance && apiKey) {
    globalInstance = new GeminiLiveAudio(apiKey);
  }
  return globalInstance;
};

export default GeminiLiveAudio;