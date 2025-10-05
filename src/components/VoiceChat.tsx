import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

interface VoiceChatProps {
  apiKey: string
  selectedVoice: string
  isConnected: boolean
  isRecording: boolean
  isPlaying: boolean
  onConnectionChange: (connected: boolean) => void
  onRecordingChange: (recording: boolean) => void
  onPlayingChange: (playing: boolean) => void
  onMessage: (type: 'user' | 'assistant', content: string, isAudio?: boolean) => void
}

interface Voice {
  id: string
  name: string
  description: string
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  apiKey,
  selectedVoice,
  isConnected,
  isRecording,
  isPlaying,
  onConnectionChange,
  onRecordingChange,
  onPlayingChange,
  onMessage
}) => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  // Lista de vozes disponíveis
  const voices: Voice[] = [
    { id: 'Puck', name: 'Puck - Masculino Jovem', description: 'Voz energética' },
    { id: 'Charon', name: 'Charon - Masculino Maduro', description: 'Voz sábia' },
    { id: 'Kore', name: 'Kore - Feminino Jovem', description: 'Voz clara' },
    { id: 'Fenrir', name: 'Fenrir - Masculino Grave', description: 'Voz profunda' },
    { id: 'Aoede', name: 'Aoede - Feminino Melodioso', description: 'Voz musical' }
  ]

  // Conectar à API Gemini Live
  const connectToGemini = async () => {
    if (!apiKey) {
      onMessage('assistant', '❌ Configure sua chave da API primeiro!')
      return
    }

    try {
      // Simular conexão WebSocket com a API Gemini Live
      // Nota: Esta é uma implementação simplificada
      // A implementação real requer integração com @google/genai
      onMessage('assistant', '🟢 Simulando conexão com Gemini Live...')
      onConnectionChange(true)
      
      // Simular resposta de conexão
      setTimeout(() => {
        onMessage('assistant', '✅ Conectado! Pode começar a falar.')
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao conectar:', error)
      onMessage('assistant', 'Erro de conexão. Verifique sua API key.')
      onConnectionChange(false)
    }
  }

  // Iniciar gravação de áudio
  const startRecording = async () => {
    if (!isConnected) {
      await connectToGemini()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Parar todas as faixas de áudio
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start(1000) // Capturar dados a cada 1 segundo
      onRecordingChange(true)
      onMessage('user', '🎤 Gravando...', true)

    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      onMessage('assistant', '❌ Erro ao acessar microfone. Permita o acesso!')
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      onRecordingChange(false)
    }
  }

  // Processar áudio gravado
  const processAudio = async (audioBlob: Blob) => {
    try {
      onMessage('user', '✅ Áudio capturado', true)
      
      // Simular processamento e resposta da IA
      setTimeout(() => {
        const responses = [
          'Olá! Como posso ajudar você hoje?',
          'Que interessante! Pode me contar mais sobre isso?',
          'Entendo sua pergunta. Vou pensar na melhor resposta.',
          'Essa é uma ótima questão! Deixe-me explicar...',
          'Posso ajudar com isso. Qual seria sua preferência?'
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        onMessage('assistant', randomResponse, true)
        
        // Simular reprodução de áudio
        playAudioResponse(randomResponse)
      }, 1500)
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
      onMessage('assistant', '❌ Erro ao processar áudio')
    }
  }

  // Simular reprodução de resposta em áudio
  const playAudioResponse = async (text: string) => {
    try {
      onPlayingChange(true)
      
      // Simular tempo de reprodução baseado no tamanho do texto
      const playTime = Math.max(2000, text.length * 50)
      
      setTimeout(() => {
        onPlayingChange(false)
      }, playTime)
      
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      onPlayingChange(false)
    }
  }

  // Toggle gravação
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Status da aplicação
  const getStatusText = () => {
    if (!apiKey) return 'Configure a API Key'
    if (!isConnected) return 'Clique para conectar'
    if (isRecording) return 'Gravando... Clique para parar'
    if (isPlaying) return 'Reproduzindo resposta...'
    return 'Clique para falar'
  }

  const getStatusClass = () => {
    if (isRecording) return 'recording'
    if (isPlaying) return 'playing'
    return 'idle'
  }

  return (
    <div className="voice-chat">
      <button
        className={`mic-button ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        disabled={!apiKey || isPlaying}
      >
        {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
      </button>

      <div className={`voice-status ${getStatusClass()}`}>
        <p>{getStatusText()}</p>
      </div>

      {isConnected && (
        <div className="voice-info">
          <p>🎵 Voz: <strong>{voices.find(v => v.id === selectedVoice)?.name || selectedVoice}</strong></p>
          <p>{isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />} {isPlaying ? 'Reproduzindo' : 'Silêncio'}</p>
        </div>
      )}

      {!apiKey && (
        <div className="api-warning">
          <p>⚠️ Configure sua chave da API Gemini</p>
        </div>
      )}
    </div>
  )
}

export default VoiceChat