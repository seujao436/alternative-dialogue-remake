import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Settings, Trash2 } from 'lucide-react'
import VoiceChat from './components/VoiceChat'
import SettingsModal from './components/Settings'
import './App.css'

export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isAudio?: boolean
}

export interface Voice {
  id: string
  name: string
  description: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('Puck')

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key')
    const savedVoice = localStorage.getItem('selected-voice')
    
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    
    if (savedVoice) {
      setSelectedVoice(savedVoice)
    }
  }, [])

  const addMessage = (type: 'user' | 'assistant', content: string, isAudio = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isAudio
    }
    setMessages(prev => [...prev, newMessage])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const saveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('gemini-api-key', key)
  }

  const saveVoice = (voice: string) => {
    setSelectedVoice(voice)
    localStorage.setItem('selected-voice', voice)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎙️ Alternative Dialogue</h1>
        <p>Conversa por voz com IA usando Gemini Live</p>
        <div className="status-bar">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </div>
          <div className="header-buttons">
            <button 
              className="icon-button"
              onClick={() => setShowSettings(true)}
              title="Configurações"
            >
              <Settings size={20} />
            </button>
            <button
              className={`icon-button ${messages.length === 0 ? 'disabled' : ''}`}
              onClick={clearMessages}
              disabled={messages.length === 0}
              title="Limpar Chat"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="chat-container">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>👋 Bem-vindo!</h3>
                <p>Configure sua API key e clique no microfone para começar a conversar</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <p>{message.content}</p>
                    {message.isAudio && <span className="audio-indicator">🎵</span>}
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <VoiceChat
          apiKey={apiKey}
          selectedVoice={selectedVoice}
          isConnected={isConnected}
          isRecording={isRecording}
          isPlaying={isPlaying}
          onConnectionChange={setIsConnected}
          onRecordingChange={setIsRecording}
          onPlayingChange={setIsPlaying}
          onMessage={addMessage}
        />
      </main>

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          selectedVoice={selectedVoice}
          onApiKeyChange={saveApiKey}
          onVoiceChange={saveVoice}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App