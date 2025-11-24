import { useRef, useState } from 'react'
import { MeshTransmissionMaterial, Text, Edges, Sparkles, CameraShake } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { FloatingItem } from './FloatingItem'
import { soundManager } from '../utils/SoundManager'
import * as THREE from 'three'

export const VendingMachine = () => {
    const [items, setItems] = useState<{ id: number; position: [number, number, number] }[]>([])
    const [hovered, setHovered] = useState(false)
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const buttonRef = useRef<THREE.Group>(null)

    const spawnItem = () => {
        soundManager.playSpawnSound()
        const id = Date.now()
        setItems([...items, { id, position: [0, 2, 0] }])

        // Trigger Juice
        setShakeIntensity(1)
        setTimeout(() => setShakeIntensity(0), 200)

        // Button Animation
        if (buttonRef.current) {
            buttonRef.current.position.z = -0.1
            setTimeout(() => {
                if (buttonRef.current) buttonRef.current.position.z = 0
            }, 100)
        }
    }

    return (
        <group>
            <CameraShake
                maxYaw={0.05 * shakeIntensity}
                maxPitch={0.05 * shakeIntensity}
                maxRoll={0.05 * shakeIntensity}
                yawFrequency={10 * shakeIntensity}
                pitchFrequency={10 * shakeIntensity}
                rollFrequency={10 * shakeIntensity}
                intensity={shakeIntensity}
                decay={true}
                decayRate={0.9}
            />

            {/* Arcade Cabinet Structure */}
            <RigidBody type="fixed" colliders="trimesh">
                {/* Base */}
                <mesh position={[0, -3.5, 0]} receiveShadow castShadow>
                    <boxGeometry args={[5, 1, 4]} />
                    <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />
                    <Edges color="#00ffff" threshold={15} />
                </mesh>

                {/* Header */}
                <mesh position={[0, 4, 0]} receiveShadow castShadow>
                    <boxGeometry args={[5, 1.5, 4]} />
                    <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />
                    <Edges color="#ff00ff" threshold={15} />
                </mesh>

                {/* Pillars */}
                <mesh position={[-2.25, 0, 0]} receiveShadow castShadow>
                    <boxGeometry args={[0.5, 8, 4]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>
                <mesh position={[2.25, 0, 0]} receiveShadow castShadow>
                    <boxGeometry args={[0.5, 8, 4]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>

                {/* Back Panel */}
                <mesh position={[0, 0, -1.5]} receiveShadow castShadow>
                    <boxGeometry args={[4, 6, 1]} />
                    <meshStandardMaterial color="#000" roughness={0.8} />
                </mesh>
            </RigidBody>

            {/* Holographic Sign */}
            <Text
                position={[0, 4, 2.1]}
                fontSize={0.6}
                color="#00ffff"
                anchorX="center"
                anchorY="middle"
            >
                COSMIC ARTIFACTS
                <meshBasicMaterial color="#00ffff" toneMapped={false} />
            </Text>

            {/* Internal Light */}
            <pointLight position={[0, 2, 0]} intensity={20} distance={10} color="#00ffff" />
            <pointLight position={[0, -2, 0]} intensity={10} distance={10} color="#ff00ff" />

            {/* Glass Front */}
            <mesh position={[0, 0.25, 1.5]}>
                <planeGeometry args={[4, 6]} />
                <MeshTransmissionMaterial
                    thickness={0.1}
                    roughness={0}
                    transmission={0.98}
                    ior={1.5}
                    chromaticAberration={0.04}
                    anisotropy={0.5}
                    backside={false}
                />
            </mesh>

            {/* Physical Button */}
            <group position={[3.5, -1, 1]} rotation={[0, -0.5, 0]}>
                <group ref={buttonRef}>
                    <mesh
                        onClick={spawnItem}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
                        <meshStandardMaterial
                            color={hovered ? "#ff00ff" : "#aa00aa"}
                            emissive={hovered ? "#ff00ff" : "#aa00aa"}
                            emissiveIntensity={hovered ? 2 : 0.5}
                        />
                    </mesh>
                    <Text position={[0, 0, 0.15]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
                        DISPENSE
                    </Text>
                </group>
                {/* Button Base */}
                <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* Sparkles on Spawn */}
            {shakeIntensity > 0 && (
                <Sparkles count={50} scale={4} size={6} speed={0.4} opacity={1} color="#00ffff" position={[0, 2, 0]} />
            )}

            {/* Spawned Items */}
            {items.map((item) => (
                <FloatingItem key={item.id} position={item.position} />
            ))}
        </group>
    )
}
