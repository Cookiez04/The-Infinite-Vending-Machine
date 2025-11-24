import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { VendingMachine } from './VendingMachine'

export const Scene = () => {
    return (
        <>
            <color attach="background" args={['#050505']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <gridHelper args={[50, 50, '#222', '#111']} position={[0, -4, 0]} />

            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={5} color="#00ffff" castShadow />
            <pointLight position={[-10, 5, -10]} intensity={5} color="#ff00ff" />

            <Physics gravity={[0, 0, 0]}>
                <VendingMachine />
            </Physics>

            <EffectComposer>
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={2} radius={0.6} />
            </EffectComposer>

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
            <Environment preset="city" background={false} />
        </>
    )
}
