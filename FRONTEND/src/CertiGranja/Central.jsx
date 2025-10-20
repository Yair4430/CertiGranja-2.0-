import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import CertiNormal from "./Normal/certiNormal"
import CertiMasivo from "./Masivo/certiMasivo"
import "./central.css"

function Central() {
  // ESTADOS PRINCIPALES
  const [modo, setModo] = useState("normal")
  const [isLoadingNormal, setIsLoadingNormal] = useState(false)
  const [isLoadingMasivo, setIsLoadingMasivo] = useState(false)
  const [conexion, setConexion] = useState({
    conectado: true,
    verificando: false,
    ultimaVerificacion: null
  })

  // VERIFICACIÓN DE CONEXIÓN PERIÓDICA
  useEffect(() => {
    const verificarConexion = async () => {
      if (conexion.verificando) return;
      
      setConexion(prev => ({ ...prev, verificando: true }))
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/estado-conexion`)
        const data = await response.json()
        
        const estabaConectado = conexion.conectado
        const ahoraConectado = data.conectado
        
        setConexion({
          conectado: ahoraConectado,
          verificando: false,
          ultimaVerificacion: data.ultima_verificacion
        })
        
      } catch (error) {
        const estabaConectado = conexion.conectado
        
        setConexion({
          conectado: false,
          verificando: false,
          ultimaVerificacion: null
        })
      }
    }

    // Verificar inmediatamente al cargar
    verificarConexion()

    // Verificar cada 15 segundos
    const intervalo = setInterval(verificarConexion, 15000)

    return () => clearInterval(intervalo)
  }, [conexion.conectado])

  // VERIFICACIÓN DE PROCESAMIENTO Y CONEXIÓN
  const isAnyProcessing = isLoadingNormal || isLoadingMasivo
  const puedeCambiarModo = !isAnyProcessing && conexion.conectado

  // MANEJADOR DE CAMBIO DE MODO
  const handleModeSwitch = () => {
    if (!puedeCambiarModo) {
      return
    }
    setModo(modo === "normal" ? "masivo" : "normal")
  }

  return (
    <div className="App">

      {/* SWITCH ANIMADO */}
      <motion.div
        className={`switch ${modo} ${!puedeCambiarModo ? "disabled" : ""}`}
        onClick={handleModeSwitch}
        whileTap={puedeCambiarModo ? { scale: 0.9 } : {}}
        style={{
          opacity: !puedeCambiarModo ? 0.5 : 1,
          cursor: !puedeCambiarModo ? "not-allowed" : "pointer",
        }}
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

      {/* CONTENIDO DINÁMICO */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modo}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="contenido"
        >
          {/* COMPONENTE CONDICIONAL CON PROP DE CONEXIÓN */}
          {modo === "normal" ? (
            <CertiNormal 
              isLoading={isLoadingNormal} 
              setIsLoading={setIsLoadingNormal}
              conexion={conexion}
            />
          ) : (
            <CertiMasivo 
              isLoading={isLoadingMasivo} 
              setIsLoading={setIsLoadingMasivo}
              conexion={conexion}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Central