import { RigidBody } from '@react-three/rapier'
import { useRef, useEffect, useMemo } from 'react'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

const GEOMETRIES = ['octahedron', 'icosahedron', 'dodecahedron'] as const

export const FloatingItem = ({ position }: { position: [number, number, number] }) => {
    const rigidBody = useRef<any>(null)
    const geometryType = useMemo(() => GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)], [])
    const color = useMemo(() => new THREE.Color().setHSL(Math.random(), 1, 0.5), [])

    useEffect(() => {
        if (rigidBody.current) {
            // Random impulse
            const x = (Math.random() - 0.5) * 5
            const y = (Math.random() - 0.5) * 5
            const z = (Math.random() - 0.5) * 2
            rigidBody.current.applyImpulse({ x, y, z }, true)
            rigidBody.current.applyTorqueImpulse({ x: Math.random(), y: Math.random(), z: Math.random() }, true)
        }
    }, [])

    return (
        <RigidBody ref={rigidBody} position={position} restitution={0.5} colliders="hull">
            <mesh castShadow receiveShadow>
                {geometryType === 'octahedron' && <octahedronGeometry args={[0.5, 0]} />}
                {geometryType === 'icosahedron' && <icosahedronGeometry args={[0.45, 0]} />}
                {geometryType === 'dodecahedron' && <dodecahedronGeometry args={[0.4, 0]} />}

                {/* Crystal Material */}
                <MeshTransmissionMaterial
                    backside={false}
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.5}
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    color={color}
                    toneMapped={false}
                />
            </mesh>
        </RigidBody>
    )
}
