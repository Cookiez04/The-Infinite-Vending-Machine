import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
      <Scene />
    </Canvas>
  )
}

export default App
