import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { VendingMachine } from './VendingMachine'
import type { VendingMachineHandle } from './VendingMachine'
import React, { lazy, Suspense } from 'react'

const EffectComposerLazy = lazy(() => import('@react-three/postprocessing').then(m => ({ default: m.EffectComposer })))
const BloomLazy = lazy(() => import('@react-three/postprocessing').then(m => ({ default: m.Bloom })))

type SceneProps = {
    vmRef?: React.Ref<VendingMachineHandle>
    bloomEnabled?: boolean
    bloomIntensity?: number
    starsEnabled?: boolean
    gridEnabled?: boolean
    sparklesEnabled?: boolean
    sparklesIntensity?: number
    lightTopIntensity?: number
    lightBottomIntensity?: number
    maxItems?: number
}

export const Scene = ({ vmRef, bloomEnabled = true, bloomIntensity = 2, starsEnabled = true, gridEnabled = true, sparklesEnabled = true, sparklesIntensity = 1, lightTopIntensity = 20, lightBottomIntensity = 10, maxItems }: SceneProps) => {
    return (
        <>
            <color attach="background" args={['#050505']} />
            {starsEnabled && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            {gridEnabled && <gridHelper args={[50, 50, '#222', '#111']} position={[0, -4, 0]} />}

            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={5} color="#00ffff" castShadow />
            <pointLight position={[-10, 5, -10]} intensity={5} color="#ff00ff" />

            <Physics gravity={[0, 0, 0]}>
                <VendingMachine ref={vmRef} sparklesEnabled={sparklesEnabled} sparklesIntensity={sparklesIntensity} lightTopIntensity={lightTopIntensity} lightBottomIntensity={lightBottomIntensity} maxItems={maxItems} />
            </Physics>

            {bloomEnabled && (
                <Suspense fallback={null}>
                    <EffectComposerLazy>
                        <BloomLazy luminanceThreshold={0.5} mipmapBlur intensity={bloomIntensity} radius={0.6} />
                    </EffectComposerLazy>
                </Suspense>
            )}

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
            <Environment preset="city" background={false} />
        </>
    )
}
