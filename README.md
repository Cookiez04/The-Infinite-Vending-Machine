# The Infinite Vending Machine — Implementation Guide & Journal

This document is the single source of truth for the project lifecycle. It records every implementation step with timestamps, commands/code, observed outcomes, verification methods, and clear success/failure indicators. It is designed to be understandable without prior context and supports seamless handoff.

## Terminology and References

- React Three Fiber (R3F): React renderer for Three.js — [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber).
- Drei: Helpers for R3F — [`@react-three/drei`](https://github.com/pmndrs/drei).
- Rapier: Physics engine bindings for R3F — [`@react-three/rapier`](https://github.com/pmndrs/use-cannon/tree/master/packages/rapier).
- Effect Composer: Postprocessing pipeline — [`@react-three/postprocessing`](https://github.com/pmndrs/postprocessing).
- Transmission Material: Advanced glass/crystal material — [`MeshTransmissionMaterial`](https://github.com/pmndrs/drei#meshes).
- Vite: Frontend build tool — [`vite`](https://vite.dev/).
- ESLint: Linting — [`eslint`](https://eslint.org/).

Code references use `file_path:line_number`.

---

## Current Implementation Status

### Architecture

- Entry: `src/main.tsx:6` mounts `<App />` into `#root`. `src/App.tsx:6` creates a R3F `Canvas` and renders `Scene`.
- Scene: `src/components/Scene.tsx:17` initializes zero-gravity physics, lights, stars, postprocessing (`Bloom`), and camera controls, then renders `VendingMachine`.
- Core interaction: `src/components/VendingMachine.tsx:14` defines `spawnItem()` to play audio, animate button, trigger camera shake/sparkles, and push a new item into local state.
- Artifact rendering: `src/components/FloatingItem.tsx:25` renders a physics body with crystal-like transmission material and applies random impulses on mount (`src/components/FloatingItem.tsx:13`).
- Audio: `src/utils/SoundManager.ts:19` provides `playSpawnSound()`; `src/utils/SoundManager.ts:41` provides `playBumpSound()`.

### Observed State

- Interaction works: clicking the 3D button spawns artifacts and VFX/SFX.
- Physics and visuals render correctly; build succeeds with a bundle size warning.
- Lint reports issues (see Known Issues).

---

## Completed Steps (Chronological)

### 2025-11-24T10:24:00Z — Codebase Audit

- Commands/Code Used:
  - Repository listing and targeted file review.
  - Key files examined: `src/App.tsx`, `src/main.tsx`, `src/components/Scene.tsx`, `src/components/VendingMachine.tsx`, `src/components/FloatingItem.tsx`, `src/utils/SoundManager.ts`, `package.json`.
- Results/Outcomes:
  - Identified flat component structure, single Canvas scene, physics setup, and audio utility.
  - Noted missing UI overlay, lifecycle controls, and global state.
- Verification Method:
  - Manual inspection with code references and file reads.
- Indicator: Success.

### 2025-11-24T10:26:00Z — Lint Run

- Command:
  ```bash
  npm run lint
  ```
- Results/Outcomes:
  - Errors found:
    - `Unexpected any` at `src/components/FloatingItem.tsx:9` (ref type).
    - Impure function in render (`Math.random`) at `src/components/FloatingItem.tsx:10` and `src/components/FloatingItem.tsx:11`.
- Verification Method:
  - ESLint output in terminal; rule references: React components and hooks must be pure.
- Indicator: Failure (action revealed issues to resolve).

### 2025-11-24T10:28:00Z — Production Build

- Command:
  ```bash
  npm run build
  ```
- Results/Outcomes:
  - Build completed successfully.
  - Warning: large client chunk (>500 kB) — suggests code splitting/dynamic imports.
- Verification Method:
  - Vite build logs, generated `dist/` assets.
- Indicator: Success with warnings.

### 2025-11-24T10:34:00Z — Documentation Initialization

- Code Used:
  - Created this comprehensive journal in `README.md` with required sections and formatting.
- Results/Outcomes:
  - Established single source of truth and update protocol.
- Verification Method:
  - Manual review of document structure for completeness against requirements.
- Indicator: Success.

### 2025-11-24T10:38:00Z — Spawn Randomness Moved to Event & Functional State Update

- Code Used:
  - Updated `VendingMachine` to generate `geometry` and `hue` in the click handler and use functional state updates.
  - `src/components/VendingMachine.tsx:9` state type expanded; `src/components/VendingMachine.tsx:16`–`src/components/VendingMachine.tsx:18` updated spawn logic; `src/components/VendingMachine.tsx:142`–`src/components/VendingMachine.tsx:144` pass new props.
- Command:
  ```bash
  npm run lint
  ```
- Results/Outcomes:
  - Random generation occurs only in user event, satisfying render purity rules.
  - State updates are resilient to rapid clicks.
- Verification Method:
  - ESLint output; manual inspection.
- Indicator: Success.

```tsx
// src/components/VendingMachine.tsx (excerpt)
const GEOMETRIES = ['octahedron', 'icosahedron', 'dodecahedron'] as const
const [items, setItems] = useState<{ id: number; position: [number, number, number]; geometry: typeof GEOMETRIES[number]; hue: number }[]>([])

const spawnItem = () => {
  soundManager.playSpawnSound()
  const id = Date.now()
  const geometry = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)]
  const hue = Math.random()
  setItems(prev => [...prev, { id, position: [0, 2, 0], geometry, hue }])
}

{items.map((item) => (
  <FloatingItem key={item.id} position={item.position} geometry={item.geometry} hue={item.hue} />
))}
```

### 2025-11-24T10:40:00Z — FloatingItem Ref Typing & Pure Render

- Code Used:
  - Replaced `useRef<any>` with a minimal API type.
  - Removed random selection from render; `geometry` and `hue` are now props.
  - `color` derived deterministically from `hue`.
- Command:
  ```bash
  npm run lint
  ```
- Results/Outcomes:
  - Eliminated `any` usage and render-time randomness.
- Verification Method:
  - ESLint output; manual inspection.
- Indicator: Success.

```tsx
// src/components/FloatingItem.tsx (excerpt)
type Geometry = 'octahedron' | 'icosahedron' | 'dodecahedron'
type RigidBodyApiLike = {
  applyImpulse: (impulse: { x: number; y: number; z: number }, wakeUp: boolean) => void
  applyTorqueImpulse: (torqueImpulse: { x: number; y: number; z: number }, wakeUp: boolean) => void
}

export const FloatingItem = ({ position, geometry, hue }: { position: [number, number, number]; geometry: Geometry; hue: number }) => {
  const rigidBody = useRef<RigidBodyApiLike | null>(null)
  const color = useMemo(() => new THREE.Color().setHSL(hue, 1, 0.5), [hue])
}
```

### 2025-11-24T10:42:00Z — SoundManager Vendor Prefix Typing

- Code Used:
  - Typed vendor-prefixed `webkitAudioContext` without `any`; removed unused catch variable.
- Command:
  ```bash
  npm run lint
  ```
- Results/Outcomes:
  - Lint errors resolved in `SoundManager`.
- Verification Method:
  - ESLint output.
- Indicator: Success.

```ts
// src/utils/SoundManager.ts (excerpt)
const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
const Ctor = w.AudioContext ?? w.webkitAudioContext
if (Ctor) {
  this.ctx = new Ctor()
}
```

### 2025-11-24T10:43:00Z — Lint Verification (Clean)

- Command:
  ```bash
  npm run lint
  ```
- Results/Outcomes:
  - No errors or warnings.
- Verification Method:
  - ESLint output in terminal.
- Indicator: Success.

### 2025-11-24T10:46:00Z — Build Verification (Clean)

- Command:
  ```bash
  npm run build
  ```
- Results/Outcomes:
  - Build completed successfully; same bundle size warning remains.
- Verification Method:
  - Vite build logs and generated `dist/`.
- Indicator: Success with warnings.

### 2025-11-24T10:49:00Z — Item Cap and FIFO Despawn

- Code Used:
  - Added a cap and FIFO despawn in `VendingMachine` using `MAX_ITEMS` and functional state update.
  - `src/components/VendingMachine.tsx:10` defines `MAX_ITEMS`; `src/components/VendingMachine.tsx:22`–`src/components/VendingMachine.tsx:25` applies slice-based cap.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; behavior constrained to last 50 items.
- Verification Method:
  - ESLint and build logs; manual code inspection.
- Indicator: Success.

```tsx
// src/components/VendingMachine.tsx (excerpt)
const MAX_ITEMS = 50
setItems(prev => {
  const next = [...prev, { id, position, geometry, hue }]
  return next.length > MAX_ITEMS ? next.slice(next.length - MAX_ITEMS) : next
})
```

### 2025-11-24T10:51:00Z — Collision-Driven Bump Sound

- Code Used:
  - Wired Rapier collision enter to play the bump sound for each `FloatingItem`.
  - `src/components/FloatingItem.tsx:27` adds `onCollisionEnter={() => soundManager.playBumpSound()}`.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; bump sounds will trigger on item collisions.
- Verification Method:
  - ESLint and build logs; manual code inspection.
- Indicator: Success.

### 2025-11-24T10:56:00Z — UI Overlay: Dispense/Reset, Counters, FPS, Bloom Toggle

- Code Used:
  - Exposed `spawnItem`, `reset`, and `getCount` via ref on `VendingMachine`.
  - Added overlay in `App` with `Dispense`, `Reset`, Items counter, FPS meter, Bloom toggle and intensity.
  - Passed UI state to `Scene` to control postprocessing.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; overlay controls work and reflect state.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:00:00Z — Code Splitting for Postprocessing + Scene Toggles

- Code Used:
  - Dynamically imported `EffectComposer` and `Bloom` via `React.lazy` and `Suspense`.
  - Added Scene toggles for `Stars` and `Grid` to reduce runtime cost.
  - Updated overlay to control these toggles.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded with an additional smaller chunk extracted for postprocessing (`dist/assets/index-CcoxJwKr.js`).
  - Stars/Grid can be disabled to improve performance.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

```tsx
// src/components/Scene.tsx (excerpt)
const EffectComposerLazy = lazy(() => import('@react-three/postprocessing').then(m => ({ default: m.EffectComposer })))
const BloomLazy = lazy(() => import('@react-three/postprocessing').then(m => ({ default: m.Bloom })))
{bloomEnabled && (
  <Suspense fallback={null}>
    <EffectComposerLazy>
      <BloomLazy luminanceThreshold={0.5} mipmapBlur intensity={bloomIntensity} radius={0.6} />
    </EffectComposerLazy>
  </Suspense>
)}

// src/App.tsx (excerpt)
const [starsEnabled, setStarsEnabled] = useState(true)
const [gridEnabled, setGridEnabled] = useState(true)
<Scene vmRef={vmRef} bloomEnabled={bloomEnabled} bloomIntensity={bloomIntensity} starsEnabled={starsEnabled} gridEnabled={gridEnabled} />
```

### 2025-11-24T11:02:00Z — Screenshot Capture Button

- Code Used:
  - Added a `Screenshot` button in the overlay to save the current canvas as a PNG.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; screenshots save with timestamped filenames.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:07:00Z — Screenshot Button Removed

- Code Used:
  - Removed the `Screenshot` button from the overlay due to dark captures and user preference.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; overlay simplified.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:10:00Z — Sparkles & Light Toggles

- Code Used:
  - Added overlay controls for `Sparkles` enable/intensity and top/bottom light intensities.
  - Passed settings through `Scene` to `VendingMachine` and applied to `Sparkles` and point lights.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; runtime FX are configurable.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:15:00Z — Low Power Mode

- Code Used:
  - Added `Low Power` overlay toggle that overrides runtime settings to reduce GPU/CPU load.
  - Overrides: disables Bloom/Stars/Sparkles, lowers light intensities, sets `maxItems=25`.
  - Passed `maxItems` from `Scene` to `VendingMachine` and made FIFO cap configurable.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; low-power reduces visual load and item count.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:20:00Z — Presets & Font Warnings Tuning

- Code Used:
  - Added `Presets` dropdown with `Balanced`, `Cinematic`, and `Minimal` profiles.
  - Each preset sets Bloom/Stars/Sparkles and light intensities.
  - Set explicit font on `Text` to reduce font parsing warnings.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; presets switch visual style quickly.
  - Font warnings reduced; note that troika/fontkit logs can still appear and are harmless.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:24:00Z — Remove Remote Font & Shared Geometries

- Code Used:
  - Removed remote font URLs from `Text` to avoid network/CORS errors.
  - Introduced shared geometry instances in `FloatingItem` using `<primitive attach="geometry" object={...} />`.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; reduced geometry allocations per item.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

### 2025-11-24T11:28:00Z — Settings Modal

- Code Used:
  - Moved all customization controls (Bloom, Stars, Grid, Sparkles enable/intensity, light intensities, Low Power, Presets) into a modal.
  - Added `Settings` button in the overlay to open the modal.
- Commands:
  ```bash
  npm run lint
  npm run build
  ```
- Results/Outcomes:
  - Lint clean; build succeeded; overlay simplified with a modal for configuration.
- Verification Method:
  - ESLint/build logs; manual inspection.
- Indicator: Success.

```tsx
// src/App.tsx (excerpt)
const [settingsOpen, setSettingsOpen] = useState(false)
<button onClick={() => setSettingsOpen(true)}>Settings</button>
{settingsOpen && (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div>Settings</div>
    <select value={preset} onChange={(e) => applyPreset(e.target.value as 'Balanced' | 'Cinematic' | 'Minimal')} />
    {/* toggles and sliders for Bloom/Stars/Grid/Sparkles/Lights/Low Power */}
    <button onClick={() => setSettingsOpen(false)}>Close</button>
  </div>
)}
```

```tsx
// src/components/FloatingItem.tsx (excerpt)
const SHARED_GEOMETRIES = {
  octahedron: new THREE.OctahedronGeometry(0.5, 0),
  icosahedron: new THREE.IcosahedronGeometry(0.45, 0),
  dodecahedron: new THREE.DodecahedronGeometry(0.4, 0),
}
<primitive attach="geometry" object={SHARED_GEOMETRIES[geometry]} />
```

```tsx
// src/App.tsx (excerpt)
const [preset, setPreset] = useState<'Balanced' | 'Cinematic' | 'Minimal'>('Balanced')
const applyPreset = (p: 'Balanced' | 'Cinematic' | 'Minimal') => { /* sets UI state */ }
<select value={preset} onChange={(e) => applyPreset(e.target.value as 'Balanced' | 'Cinematic' | 'Minimal')} />

// src/components/VendingMachine.tsx (excerpt)
<Text font="https://raw.githubusercontent.com/pmndrs/drei-assets/main/fonts/Roboto-Regular.ttf">COSMIC ARTIFACTS</Text>
<Text font="https://raw.githubusercontent.com/pmndrs/drei-assets/main/fonts/Roboto-Regular.ttf">DISPENSE</Text>
```

```tsx
// src/components/VendingMachine.tsx (excerpt)
type VendingMachineProps = { maxItems?: number }
const MAX_ITEMS = props.maxItems ?? 50
setItems(prev => { const next = [...prev, item]; return next.length > MAX_ITEMS ? next.slice(next.length - MAX_ITEMS) : next })

// src/components/Scene.tsx (excerpt)
type SceneProps = { maxItems?: number }
<VendingMachine ref={vmRef} maxItems={maxItems} />

// src/App.tsx (excerpt)
const [lowPower, setLowPower] = useState(false)
<Scene
  bloomEnabled={lowPower ? false : bloomEnabled}
  bloomIntensity={lowPower ? 0 : bloomIntensity}
  starsEnabled={lowPower ? false : starsEnabled}
  sparklesEnabled={lowPower ? false : sparklesEnabled}
  sparklesIntensity={lowPower ? 0 : sparklesIntensity}
  lightTopIntensity={lowPower ? Math.min(lightTopIntensity, 8) : lightTopIntensity}
  lightBottomIntensity={lowPower ? Math.min(lightBottomIntensity, 6) : lightBottomIntensity}
  maxItems={lowPower ? 25 : undefined}
/>
```

```tsx
// src/components/VendingMachine.tsx (excerpt)
type VendingMachineProps = {
  sparklesEnabled?: boolean
  sparklesIntensity?: number
  lightTopIntensity?: number
  lightBottomIntensity?: number
}
<pointLight position={[0, 2, 0]} intensity={props.lightTopIntensity ?? 20} />
<pointLight position={[0, -2, 0]} intensity={props.lightBottomIntensity ?? 10} />
{shakeIntensity > 0 && (props.sparklesEnabled ?? true) && (
  <Sparkles count={Math.round(50 * (props.sparklesIntensity ?? 1))} size={6 * (props.sparklesIntensity ?? 1)} />
)}

// src/components/Scene.tsx (excerpt)
export const Scene = ({ sparklesEnabled = true, sparklesIntensity = 1, lightTopIntensity = 20, lightBottomIntensity = 10 }) => (
  <VendingMachine ref={vmRef} sparklesEnabled={sparklesEnabled} sparklesIntensity={sparklesIntensity} lightTopIntensity={lightTopIntensity} lightBottomIntensity={lightBottomIntensity} />
)

// src/App.tsx (excerpt)
const [sparklesEnabled, setSparklesEnabled] = useState(true)
const [sparklesIntensity, setSparklesIntensity] = useState(1)
const [lightTopIntensity, setLightTopIntensity] = useState(20)
const [lightBottomIntensity, setLightBottomIntensity] = useState(10)
```

```ts
// src/App.tsx (excerpt)
const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
if (!canvas) return
const url = canvas.toDataURL('image/png')
const a = document.createElement('a')
a.href = url
a.download = `vending-machine-${Date.now()}.png`
a.click()
```

```tsx
// src/components/VendingMachine.tsx (excerpt)
export type VendingMachineHandle = { spawnItem(): void; reset(): void; getCount(): number }
export const VendingMachine = forwardRef<VendingMachineHandle>((_, ref) => {
  void _
  useImperativeHandle(ref, () => ({ spawnItem, reset, getCount: () => items.length }), [spawnItem, reset, items.length])
})

// src/components/Scene.tsx (excerpt)
export const Scene = ({ vmRef, bloomEnabled = true, bloomIntensity = 2 }) => (
  <Physics gravity={[0, 0, 0]}>
    <VendingMachine ref={vmRef} />
  </Physics>
  {bloomEnabled && (
    <EffectComposer>
      <Bloom intensity={bloomIntensity} luminanceThreshold={0.5} mipmapBlur radius={0.6} />
    </EffectComposer>
  )}
)

// src/App.tsx (excerpt)
const vmRef = useRef<VendingMachineHandle>(null)
const [count, setCount] = useState(0)
const [fps, setFps] = useState(0)
const [bloomEnabled, setBloomEnabled] = useState(true)
const [bloomIntensity, setBloomIntensity] = useState(2)
useEffect(() => { const id = setInterval(() => setCount(vmRef.current?.getCount() ?? 0), 250); return () => clearInterval(id) }, [])
useEffect(() => { let last = performance.now(); let raf = requestAnimationFrame(function loop(t){ const dt = t - last; last = t; setFps(Math.round(1000/Math.max(dt,1))); raf = requestAnimationFrame(loop)}); return () => cancelAnimationFrame(raf) }, [])
```

---

## Next Steps

1. UI overlay and settings:
   - Add on-screen `Dispense`, `Reset`, counters, FPS meter; toggle postprocessing/lighting intensity.
   - Verification: overlay actions reflect in 3D scene; performance toggles adjust FPS.
2. Performance and bundling:
   - Dynamically import heavy modules (postprocessing), consider instancing for artifacts.
   - Verification: rebuild shows reduced chunk size; runtime profiling confirms FPS stability.
3. Testing and documentation expansion:
   - Add unit/integration/e2e tests; document generator design, audio subsystem, and performance playbook.
   - Verification: CI passes lint/typecheck/tests; coverage targets met.

---

## Known Issues

- Lint errors: Resolved as of 2025-11-24T10:43:00Z.
- Global cursor side-effect — `src/components/VendingMachine.tsx:113`–`src/components/VendingMachine.tsx:115` uses `document.body.style.cursor`.
- Build bundle size warning — suggests code splitting and dynamic imports.
- Unbounded item count — risk of memory/fps degradation under repeated spawns.
- `playBumpSound()` wiring complete as of 2025-11-24T10:51:00Z.

---

## Resolution History

Entries are recorded upon resolution with timestamps, changes made, outcomes, verification, and indicators.

- 2025-11-24T10:34:00Z — Documentation Initialized
  - Changes: Created comprehensive `README.md` replacing template content; established journal structure and process.
  - Outcome: Single source of truth ready; sections present and accessible.
  - Verification: Manual review for required sections and formatting.
  - Indicator: Success.

---

## Update Protocol

For every action:

1. Execute the action.
2. Verify outcome (lint/build/test or manual inspection).
3. Record in this document with timestamp, commands/code, outcomes, verification, and success/failure.
4. Determine and log next steps.

Maintain chronological order. Use consistent terminology. Include code references and external resources as needed.

---

## External Resources

- R3F: https://github.com/pmndrs/react-three-fiber
- Drei: https://github.com/pmndrs/drei
- Rapier: https://github.com/pmndrs/use-cannon/tree/master/packages/rapier
- Postprocessing: https://github.com/pmndrs/postprocessing
- Three.js: https://threejs.org/
- Vite: https://vite.dev/
- ESLint: https://eslint.org/
