export class SoundManager {
    private ctx: AudioContext | null = null

    constructor() {
        try {
            const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
            const Ctor = w.AudioContext ?? w.webkitAudioContext
            if (Ctor) {
                this.ctx = new Ctor()
            }
        } catch {
            console.error('Web Audio API not supported')
        }
    }

    private init() {
        if (!this.ctx) return
        if (this.ctx.state === 'suspended') {
            this.ctx.resume()
        }
    }

    playSpawnSound() {
        this.init()
        if (!this.ctx) return

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        // "Boing" / "Pew" sound
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3)

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.3)
    }

    playBumpSound() {
        this.init()
        if (!this.ctx) return

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        // Low thud
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(100, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.1)
    }
}

export const soundManager = new SoundManager()
