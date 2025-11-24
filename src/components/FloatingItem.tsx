import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { soundManager } from '../utils/SoundManager'
import { useRef, useEffect, useMemo } from 'react'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

type Geometry = 'octahedron' | 'icosahedron' | 'dodecahedron'

const SHARED_GEOMETRIES: Record<Geometry, THREE.BufferGeometry> = {
    octahedron: new THREE.OctahedronGeometry(0.5, 0),
    icosahedron: new THREE.IcosahedronGeometry(0.45, 0),
    dodecahedron: new THREE.DodecahedronGeometry(0.4, 0),
}


export const FloatingItem = ({ position, geometry, hue }: { position: [number, number, number]; geometry: Geometry; hue: number }) => {
    const rigidBody = useRef<RapierRigidBody | null>(null)
    const color = useMemo(() => new THREE.Color().setHSL(hue, 1, 0.5), [hue])

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
        <RigidBody ref={rigidBody} position={position} restitution={0.5} colliders="hull" onCollisionEnter={() => soundManager.playBumpSound()}>
            <mesh castShadow receiveShadow>
                <primitive attach="geometry" object={SHARED_GEOMETRIES[geometry]} />
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
