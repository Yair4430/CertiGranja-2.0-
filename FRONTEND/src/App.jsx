import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import CertiNormal from "./Componentes V1/CertiNormal"
import CertiMasivo from "./Componentes V2/CertiMasivo"
import "./App.css" // importamos los estilos

function App() {
  const [modo, setModo] = useState("normal") // Estado inicial en "normal"

  return (
    <div className="App">
      {/* Switch estilo palanca */}
      <div
        className={`switch ${modo}`}
        onClick={() => setModo(modo === "normal" ? "masivo" : "normal")}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`switch-slider ${modo}`}
        >
          {modo === "normal" ? "Normal" : "Masivo"}
        </motion.div>
      </div>

      {/* Contenido con animación */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="contenido"
        >
          {modo === "normal" ? <CertiNormal /> : <CertiMasivo />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
