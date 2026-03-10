export function createSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  type WindowWithSpeech = Window & typeof globalThis & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  const w = window as WindowWithSpeech;
  const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return null;
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  return recognition;
}

// Chrome has a bug where speechSynthesis pauses after ~15s and onend never fires.
// Fix: keep-alive interval + hard timeout fallback.
export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural'))) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(keepAlive);
      clearTimeout(fallbackTimeout);
      if (onEnd) onEnd();
    };

    // Chrome keep-alive: resume every 10s to prevent the pause bug
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
    }, 10000);

    // Hard fallback: estimate ~70 words/min, min 3s, max 20s
    const wordCount = text.split(/\s+/).length;
    const estimatedMs = Math.max(3000, Math.min((wordCount / 70) * 60000 * 1.3, 20000));
    const fallbackTimeout = setTimeout(finish, estimatedMs + 2000);

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  };

  // Voices may not be loaded yet on first call — wait if needed
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    // If onvoiceschanged never fires, fall back after 1s
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) doSpeak();
    }, 1000);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
  }
}
