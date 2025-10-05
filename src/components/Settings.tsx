import React, { useState } from 'react'
import { X, Key, Mic, ExternalLink } from 'lucide-react'

interface SettingsProps {
  apiKey: string
  selectedVoice: string
  onApiKeyChange: (key: string) => void
  onVoiceChange: (voice: string) => void
  onClose: () => void
}

interface Voice {
  id: string
  name: string
  description: string
}

const Settings: React.FC<SettingsProps> = ({
  apiKey,
  selectedVoice,
  onApiKeyChange,
  onVoiceChange,
  onClose
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const [tempVoice, setTempVoice] = useState(selectedVoice)

  const voices: Voice[] = [
    { id: 'Puck', name: 'Puck - Masculino Jovem', description: 'Voz jovem e energética' },
    { id: 'Charon', name: 'Charon - Masculino Maduro', description: 'Voz madura e sábia' },
    { id: 'Kore', name: 'Kore - Feminino Jovem', description: 'Voz feminina clara' },
    { id: 'Fenrir', name: 'Fenrir - Masculino Grave', description: 'Voz profunda e forte' },
    { id: 'Aoede', name: 'Aoede - Feminino Melodioso', description: 'Voz suave e musical' }
  ]

  const handleSave = () => {
    onApiKeyChange(tempApiKey)
    onVoiceChange(tempVoice)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  return (
    <div className="settings-modal" onKeyDown={handleKeyDown}>
      <div className="settings-content">
        <div className="settings-header">
          <h2>⚙️ Configurações</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-body">
          <div className="form-group">
            <label htmlFor="api-key">
              <Key size={16} />
              Chave da API Gemini
            </label>
            <input
              id="api-key"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Insira sua chave da API do Google AI Studio"
              autoComplete="off"
            />
            <div className="field-help">
              <p>
                🔗 Obtenha sua chave gratuita em:{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Google AI Studio <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="voice-select">
              <Mic size={16} />
              Voz da IA
            </label>
            <select
              id="voice-select"
              value={tempVoice}
              onChange={(e) => setTempVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
            <div className="field-help">
              <p>🎵 {voices.find(v => v.id === tempVoice)?.description}</p>
            </div>
          </div>

          <div className="api-info">
            <h3>📋 Instruções de Configuração</h3>
            <ol>
              <li>Acesse <strong>Google AI Studio</strong></li>
              <li>Clique em <strong>"Get API Key"</strong></li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Copie a chave gerada</li>
              <li>Cole aqui e salve</li>
            </ol>
          </div>

          <div className="privacy-note">
            <p>🔒 <strong>Privacidade:</strong> Sua chave é armazenada apenas localmente no seu navegador.</p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="save-btn" onClick={handleSave}>
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings