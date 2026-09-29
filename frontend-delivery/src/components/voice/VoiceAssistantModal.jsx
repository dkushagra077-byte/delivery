import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, X } from 'lucide-react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { Button } from '../common/Button';

export const VoiceAssistantModal = ({ isOpen, onClose, onCommandExecute }) => {
  const [textInput, setTextInput] = useState('');

  const {
    isListening,
    isSupported,
    isMuted,
    transcript,
    feedback,
    pendingConfirmation,
    startListening,
    stopListening,
    toggleMute,
    processCommand
  } = useVoiceAssistant({
    onCommand: (cmd) => {
      if (onCommandExecute) onCommandExecute(cmd);
    }
  });

  if (!isOpen) return null;

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processCommand(textInput);
    setTextInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: 'var(--bg-surface)'
        }}
      >
        {/* Top Controls: Mute and Close */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DropPulse Voice AI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Voice Responses' : 'Mute Voice Responses'}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                color: isMuted ? 'var(--danger)' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Animated Microphone Orb */}
        <div style={{ position: 'relative', margin: '10px 0' }}>
          {isListening && (
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                right: '-15px',
                bottom: '-15px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(6, 182, 212, 0) 70%)',
                animation: 'pulseGlow 1.5s infinite ease-out'
              }}
            />
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: isListening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #2563eb, #06b6d4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening
                ? '0 0 30px rgba(239, 68, 68, 0.6)'
                : '0 0 25px rgba(37, 99, 235, 0.5)',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {isListening ? <Mic size={36} /> : <Mic size={36} />}
          </button>
        </div>

        {/* Status & Feedback Text */}
        <div style={{ textAlign: 'center', width: '100%', minHeight: '60px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            {isListening
              ? '🎙 Listening... Speak clearly now'
              : pendingConfirmation
              ? '⚠️ Confirmation Required'
              : 'Tap microphone or type a command'}
          </p>

          <p style={{ fontSize: '0.875rem', color: pendingConfirmation ? '#f59e0b' : 'var(--text-muted)' }}>
            {feedback || (transcript ? `"${transcript}"` : 'Try: "Show my active deliveries" or "Where is my delivery?"')}
          </p>
        </div>

        {/* Confirmation Buttons if Pending */}
        {pendingConfirmation && (
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <Button
              variant="success"
              style={{ flex: 1 }}
              onClick={() => processCommand('yes')}
            >
              Yes, Confirm
            </Button>
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onClick={() => processCommand('no')}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Quick Command Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {[
            'Show my active deliveries',
            'Where is my delivery?',
            'Mark package as picked up',
            'Turn on location tracking',
            'Go to dashboard'
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => processCommand(cmd)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              "{cmd}"
            </button>
          ))}
        </div>

        {/* Text Fallback Input */}
        <form onSubmit={handleTextSubmit} style={{ width: '100%', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type a voice command fallback..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <Button type="submit" variant="primary" icon={Send}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
