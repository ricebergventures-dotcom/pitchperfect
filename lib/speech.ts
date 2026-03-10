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

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(
      (v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find((v) => v.lang === 'en-US');
  if (preferredVoice) utterance.voice = preferredVoice;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
  }
}
