// Web Audio Synthesizer for royalty-free background beats and audio effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBeat = false;
  private currentBeatTimeout: number | null = null;
  private activeNodes: AudioNode[] = [];

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'suspended') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  // Play a brief positive chime when generation finishes
  playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.36);
      });
    } catch (e) {
      console.warn('Audio feedback not available:', e);
    }
  }

  // Play ambient musical backing track for video preview
  playBackgroundMusic(genre: string = 'Afro Chill', volume: number = 0.3) {
    this.stopBackgroundMusic();
    try {
      const ctx = this.getContext();
      this.isPlayingBeat = true;

      // Chord progressions based on genre
      let chords: number[][];
      let tempoMs = 500; // default 120 bpm

      if (genre.includes('Afro')) {
        chords = [
          [261.63, 329.63, 392.0], // C
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [196.0, 246.94, 293.66], // G
        ];
        tempoMs = 450;
      } else if (genre.includes('Lounge') || genre.includes('Luxury')) {
        chords = [
          [293.66, 369.99, 440.0, 523.25], // Dm7
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 277.18, 329.63, 392.0],  // A7
          [349.23, 440.0, 523.25, 659.25], // Fmaj7
        ];
        tempoMs = 600;
      } else if (genre.includes('Commercial') || genre.includes('Hype')) {
        chords = [
          [329.63, 392.0, 493.88], // Em
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
          [293.66, 369.99, 440.0], // D
        ];
        tempoMs = 380;
      } else {
        chords = [
          [261.63, 329.63, 392.0],
          [196.0, 246.94, 293.66],
          [220.0, 261.63, 329.63],
          [174.61, 220.0, 261.63],
        ];
        tempoMs = 480;
      }

      let step = 0;
      const playStep = () => {
        if (!this.isPlayingBeat) return;
        const currentChord = chords[step % chords.length];
        const now = ctx.currentTime;

        // Play chord pad
        currentChord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = genre.includes('Lounge') ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (tempoMs / 1000) * 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + (tempoMs / 1000) * 1.9);
          this.activeNodes.push(osc, gain);
        });

        // Add soft rhythmic percussive kick/hat
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(step % 2 === 0 ? 120 : 80, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        kickGain.gain.setValueAtTime(volume * 0.15, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        kickOsc.connect(kickGain);
        kickGain.connect(ctx.destination);

        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
        this.activeNodes.push(kickOsc, kickGain);

        step++;
        this.currentBeatTimeout = window.setTimeout(playStep, tempoMs);
      };

      playStep();
    } catch (e) {
      console.warn('Error playing synthesizer beat:', e);
    }
  }

  stopBackgroundMusic() {
    this.isPlayingBeat = false;
    if (this.currentBeatTimeout) {
      clearTimeout(this.currentBeatTimeout);
      this.currentBeatTimeout = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  // Play Speech synthesis with French voice
  speakText(text: string, voiceName?: string, onEnd?: () => void): boolean {
    if (!('speechSynthesis' in window)) return false;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.pitch = voiceName?.includes('fatou') || voiceName?.includes('Fatou') ? 1.15 : 1.02;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      (v) => v.lang.startsWith('fr') && (v.name.includes('Female') || v.name.includes('Amélie') || v.name.includes('Thomas') || v.name.includes('Google'))
    ) || voices.find((v) => v.lang.startsWith('fr'));

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioSynth = new SoundEngine();
