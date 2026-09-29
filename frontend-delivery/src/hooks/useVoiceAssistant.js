import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const useVoiceAssistant = ({ onCommand, onConfirmationRequired } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSupported, setIsSupported] = useState(Boolean(SpeechRecognition));
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('voice_muted') === 'true';
  });
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const recognitionRef = useRef(null);

  // Text to speech helper
  const speak = useCallback(
    (text) => {
      if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('voice_muted', String(next));
      if (next && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  // Process voice or typed command
  const processCommand = useCallback(
    (commandText) => {
      const clean = commandText.trim().toLowerCase();
      setTranscript(clean);

      // 1. Check if we are waiting for a confirmation (e.g. Yes / No)
      if (pendingConfirmation) {
        if (clean.includes('yes') || clean.includes('confirm') || clean.includes('do it') || clean.includes('sure')) {
          const action = pendingConfirmation.action;
          setPendingConfirmation(null);
          setFeedback(`Action confirmed: ${action.name}`);
          speak(`Confirmed. Executing ${action.name}.`);
          if (action.callback) action.callback();
          return;
        } else if (clean.includes('no') || clean.includes('cancel') || clean.includes('never mind')) {
          setPendingConfirmation(null);
          setFeedback('Action cancelled.');
          speak('Cancelled.');
          return;
        } else {
          setFeedback('Please say Yes to confirm or No to cancel.');
          speak('Please say Yes to confirm or No to cancel.');
          return;
        }
      }

      // 2. Sensitive Action: Mark as Delivered (Requires Confirmation)
      if (clean.includes('mark') && clean.includes('delivered')) {
        const confirmMsg = 'Are you sure you want to mark this delivery as delivered?';
        setFeedback(confirmMsg);
        speak(confirmMsg);
        setPendingConfirmation({
          action: {
            name: 'Mark Delivered',
            callback: () => onCommand && onCommand({ type: 'MARK_DELIVERED' })
          }
        });
        if (onConfirmationRequired) {
          onConfirmationRequired('MARK_DELIVERED', confirmMsg);
        }
        return;
      }

      // 3. Mark Picked Up
      if (clean.includes('picked up') || clean.includes('mark package as picked up')) {
        const msg = 'Marking package as picked up.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'MARK_PICKED_UP' });
        return;
      }

      // 4. Show Active Deliveries
      if (clean.includes('active deliveries') || clean.includes('show my active') || clean.includes('today')) {
        const msg = 'Showing your active deliveries.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'SHOW_ACTIVE_DELIVERIES' });
        return;
      }

      // 5. Where is my delivery?
      if (clean.includes('where is my delivery') || clean.includes('track delivery') || clean.includes('where is')) {
        const msg = 'Opening live tracking map.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'TRACK_DELIVERY' });
        return;
      }

      // 6. Navigation: Go to Dashboard
      if (clean.includes('go to dashboard') || clean.includes('dashboard') || clean.includes('home')) {
        const msg = 'Navigating to dashboard.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'NAVIGATE_DASHBOARD' });
        return;
      }

      // 7. Show Delivery History
      if (clean.includes('delivery history') || clean.includes('show history') || clean.includes('past orders')) {
        const msg = 'Opening delivery history.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'NAVIGATE_HISTORY' });
        return;
      }

      // 8. Turn On / Off Location Tracking
      if (clean.includes('turn on location') || clean.includes('start tracking') || clean.includes('enable gps')) {
        const msg = 'Starting live GPS location tracking.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'ENABLE_LOCATION' });
        return;
      }

      if (clean.includes('turn off location') || clean.includes('stop tracking') || clean.includes('disable gps')) {
        const msg = 'Location tracking disabled.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'DISABLE_LOCATION' });
        return;
      }

      // 9. Show Customer Details
      if (clean.includes('customer details') || clean.includes('show recipient')) {
        const msg = 'Displaying customer recipient information.';
        setFeedback(msg);
        speak(msg);
        if (onCommand) onCommand({ type: 'SHOW_CUSTOMER_DETAILS' });
        return;
      }

      // Default unrecognized
      const unrec = `Heard: "${clean}". Say "Show active deliveries", "Where is my delivery", or "Go to dashboard".`;
      setFeedback(unrec);
      speak(`I did not recognize that command. You can say: Show active deliveries, or where is my delivery.`);
    },
    [pendingConfirmation, onCommand, onConfirmationRequired, speak]
  );

  // Initialize Speech Recognition
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setFeedback('Speech recognition is not supported in this browser. Please use text input below.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback('🎙 Listening for command...');
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      processCommand(speechToText);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setFeedback(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    isMuted,
    transcript,
    feedback,
    pendingConfirmation,
    startListening,
    stopListening,
    toggleMute,
    processCommand,
    speak
  };
};
