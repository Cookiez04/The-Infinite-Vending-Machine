import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { useEffect, useRef, useState } from 'react'
import type { VendingMachineHandle } from './components/VendingMachine'

function App() {
  const vmRef = useRef<VendingMachineHandle>(null)
  const [count, setCount] = useState(0)
  const [fps, setFps] = useState(0)
  const [bloomEnabled, setBloomEnabled] = useState(true)
  const [bloomIntensity, setBloomIntensity] = useState(2)
  const [starsEnabled, setStarsEnabled] = useState(true)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [sparklesEnabled, setSparklesEnabled] = useState(true)
  const [sparklesIntensity, setSparklesIntensity] = useState(1)
  const [lightTopIntensity, setLightTopIntensity] = useState(20)
  const [lightBottomIntensity, setLightBottomIntensity] = useState(10)
  const [lowPower, setLowPower] = useState(false)
  const [preset, setPreset] = useState<'Balanced' | 'Cinematic' | 'Minimal'>('Balanced')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const applyPreset = (p: 'Balanced' | 'Cinematic' | 'Minimal') => {
    setPreset(p)
    if (p === 'Balanced') {
      setBloomEnabled(true)
      setBloomIntensity(2)
      setStarsEnabled(true)
      setSparklesEnabled(true)
      setSparklesIntensity(1)
      setLightTopIntensity(20)
      setLightBottomIntensity(10)
    } else if (p === 'Cinematic') {
      setBloomEnabled(true)
      setBloomIntensity(2.6)
      setStarsEnabled(true)
      setSparklesEnabled(true)
      setSparklesIntensity(1.8)
      setLightTopIntensity(28)
      setLightBottomIntensity(16)
    } else {
      setBloomEnabled(false)
      setBloomIntensity(0)
      setStarsEnabled(false)
      setSparklesEnabled(false)
      setSparklesIntensity(0)
      setLightTopIntensity(8)
      setLightBottomIntensity(6)
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      const c = vmRef.current?.getCount() ?? 0
      setCount(c)
    }, 250)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let last = performance.now()
    let raf = 0
    const loop = (t: number) => {
      const dt = t - last
      last = t
      setFps(Math.round(1000 / Math.max(dt, 1)))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
        <Scene
          vmRef={vmRef}
          bloomEnabled={lowPower ? false : bloomEnabled}
          bloomIntensity={lowPower ? 0 : bloomIntensity}
          starsEnabled={lowPower ? false : starsEnabled}
          gridEnabled={gridEnabled}
          sparklesEnabled={lowPower ? false : sparklesEnabled}
          sparklesIntensity={lowPower ? 0 : sparklesIntensity}
          lightTopIntensity={lowPower ? Math.min(lightTopIntensity, 8) : lightTopIntensity}
          lightBottomIntensity={lowPower ? Math.min(lightBottomIntensity, 6) : lightBottomIntensity}
          maxItems={lowPower ? 25 : undefined}
        />
      </Canvas>
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(20,20,20,0.6)', padding: '10px 12px', borderRadius: 8, color: '#fff', backdropFilter: 'blur(6px)' }}>
        <button onClick={() => vmRef.current?.spawnItem()} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #00ffff', background: '#001b1b', color: '#00ffff' }}>Dispense</button>
        <button onClick={() => vmRef.current?.reset()} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ff00ff', background: '#1b001b', color: '#ff00ff' }}>Reset</button>
        <span>Items: {count}</span>
        <span>FPS: {fps}</span>
        <button onClick={() => setSettingsOpen(true)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #888', background: '#222', color: '#ddd' }}>Settings</button>
      </div>
      {settingsOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 520, maxWidth: '90%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' }}>
              <div>Settings</div>
              <button onClick={() => setSettingsOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #555', background: '#222', color: '#ddd' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={bloomEnabled} onChange={(e) => setBloomEnabled(e.target.checked)} /> Bloom
              </label>
              <input type="range" min={0} max={3} step={0.1} value={bloomIntensity} onChange={(e) => setBloomIntensity(parseFloat(e.target.value))} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={starsEnabled} onChange={(e) => setStarsEnabled(e.target.checked)} /> Stars
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={gridEnabled} onChange={(e) => setGridEnabled(e.target.checked)} /> Grid
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={sparklesEnabled} onChange={(e) => setSparklesEnabled(e.target.checked)} /> Sparkles
              </label>
              <input type="range" min={0} max={3} step={0.1} value={sparklesIntensity} onChange={(e) => setSparklesIntensity(parseFloat(e.target.value))} />
              <div>Top Light</div>
              <input type="range" min={0} max={40} step={1} value={lightTopIntensity} onChange={(e) => setLightTopIntensity(parseFloat(e.target.value))} />
              <div>Bottom Light</div>
              <input type="range" min={0} max={40} step={1} value={lightBottomIntensity} onChange={(e) => setLightBottomIntensity(parseFloat(e.target.value))} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={lowPower} onChange={(e) => setLowPower(e.target.checked)} /> Low Power Mode
              </label>
              <select value={preset} onChange={(e) => applyPreset(e.target.value as 'Balanced' | 'Cinematic' | 'Minimal')} style={{ padding: '6px 10px', borderRadius: 6 }}>
                <option value="Balanced">Balanced</option>
                <option value="Cinematic">Cinematic</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
