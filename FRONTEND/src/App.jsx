import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import CertiNormal from "./Componentes V1/CertiNormal"
import CertiMasivo from "./Componentes V2/CertiMasivo"
import "./App.css"

function App() {
  const [modo, setModo] = useState("normal")

  return (
    <div className="App">
      {/* Switch con animación */}
      <motion.div
        className={`switch ${modo}`}
        onClick={() => setModo(modo === "normal" ? "masivo" : "normal")}
        whileTap={{ scale: 0.9 }} // efecto click
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`switch-slider ${modo}`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={modo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {modo === "normal" ? "Normal" : "Masivo"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Contenido con animación */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modo}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
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
