"use client"

import { useState, useEffect, useRef } from "react"
import { FaFileDownload, FaBook, FaFolderPlus, FaFolder, FaFileAlt } from "react-icons/fa"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import "./CertiMasivo.css"

const getApiUrl = () => {
  try {
    return import.meta.env?.VITE_API_URL || "http://localhost:5000"
  } catch (error) {
    return "http://localhost:5000"
  }
}

const API_URL = getApiUrl()

const showAlert = (type, title, text) => {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    background: "#ffffff",
    confirmButtonColor: "#0ea5e9",
    customClass: {
      popup: "rounded-xl shadow-lg",
      title: "font-bold text-lg",
      confirmButton: "px-4 py-2",
    },
  })
}

export default function CertiMasivo({ isLoading, setIsLoading }) {
  const [ruta, setRuta] = useState("")
  const [totalCarpetas, setTotalCarpetas] = useState(0)
  const [carpetaActualIndex, setCarpetaActualIndex] = useState(0)
  const [progressFilas, setProgressFilas] = useState(0)
  const [carpetaActual, setCarpetaActual] = useState("")
  const [templateDownloaded, setTemplateDownloaded] = useState(false)
  const [manualDownloaded, setManualDownloaded] = useState(false)

  const intervalRef = useRef(null)

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isLoading) {
        event.preventDefault()
        event.returnValue = "El proceso aún está en ejecución. ¿Estás seguro de que quieres salir?"
        return event.returnValue
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isLoading])

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/progreso`)
      if (!response.ok) return "error"

      const data = await response.json()
      const { carpetas, filas } = data

      if (carpetas.total > 0) {
        setTotalCarpetas(carpetas.total)
        setCarpetaActualIndex(carpetas.actual)
        setCarpetaActual(carpetas.carpeta_actual || "")
      }

      if (filas.total > 0) {
        const porcentajeFilas = Math.round((filas.actual / filas.total) * 100)
        setProgressFilas(porcentajeFilas)
      }

      if (carpetas.error) {
        setIsLoading(false)
        return "error"
      }

      if (carpetas.finalizado) {
        setIsLoading(false)
        return "finished"
      }

      return "running"
    } catch {
      return "error"
    }
  }

  const handleStartProcess = async () => {
    if (!ruta.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Ruta no ingresada",
        text: "Por favor ingresa una ruta antes de continuar.",
        confirmButtonText: "Aceptar",
        background: "#ffffff",
        confirmButtonColor: "#0ea5e9",
        customClass: {
          popup: "rounded-xl shadow-lg",
          title: "font-bold text-lg",
          confirmButton: "px-4 py-2",
        },
      }).then(() => setRuta(""))
      return
    }

    const windowsPathRegex = /^[a-zA-Z]:(\\[^<>:"/\\|?*]+)+\\?$/
    const unixPathRegex = /^(\/[^<>:"/\\|?*]+)+\/?$/

    if (!windowsPathRegex.test(ruta) && !unixPathRegex.test(ruta)) {
      Swal.fire({
        icon: "error",
        title: "Ruta inválida",
        text: "La ruta ingresada no es válida. Ejemplo:\n- Windows: C:\\Usuarios\\Carpeta\n- Linux/Mac: /home/usuario/carpeta",
        confirmButtonText: "Aceptar",
        background: "#ffffff",
        confirmButtonColor: "#0ea5e9",
        customClass: {
          popup: "rounded-xl shadow-lg",
          title: "font-bold text-lg",
          confirmButton: "px-4 py-2",
        },
      }).then(() => setRuta(""))
      return
    }

    // ✅ ALERTA ANTES DE INICIAR EL PROCESO
    const result = await Swal.fire({
      icon: "success",
      title: "Carpeta encontrada",
      text: "La carpeta se detectó exitosamente. Presiona Aceptar para iniciar el proceso.",
      confirmButtonText: "Aceptar",
      background: "#ffffff",
      confirmButtonColor: "#0ea5e9",
    })

    // Solo si el usuario presiona "Aceptar"
    if (result.isConfirmed) {
      setIsLoading(true)
      setTotalCarpetas(0)
      setCarpetaActualIndex(0)
      setProgressFilas(0)
      setCarpetaActual("")

      try {
        const response = await fetch(`${API_URL}/iniciar-automatizacion-masiva`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruta }),
        })

        if (!response.ok) throw new Error("Error en la automatización masiva")

        // 🚀 Inicia el intervalo de progreso
        intervalRef.current = setInterval(async () => {
          const status = await fetchProgress()

          if (status === "finished") {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            Swal.fire({
              icon: "success",
              title: "Proceso finalizado",
              text: "Los resultados ya están disponibles en la carpeta de descargas.",
              confirmButtonText: "Aceptar",
              background: "#ffffff",
              confirmButtonColor: "#0ea5e9",
            }).then(() => setRuta(""))
          } else if (status === "error") {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            Swal.fire({
              icon: "error",
              title: "Error en el proceso",
              text: "Hubo un problema durante la automatización.",
              confirmButtonText: "Aceptar",
              background: "#ffffff",
              confirmButtonColor: "#0ea5e9",
            }).then(() => setRuta(""))
            setTotalCarpetas(0)
            setCarpetaActualIndex(0)
            setProgressFilas(0)
            setIsLoading(false)
          }
        }, 1500)
      } catch (error) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor.",
          confirmButtonText: "Aceptar",
          background: "#ffffff",
          confirmButtonColor: "#0ea5e9",
        }).then(() => setRuta(""))
        setTotalCarpetas(0)
        setCarpetaActualIndex(0)
        setProgressFilas(0)
        setIsLoading(false)
      }
    }
  }

  const handleDownloadTemplate = () => {
    // Implement template download logic here
  }

  const handleDownloadManual = () => {
    // Implement manual download logic here
  }

  return (
    <div className="cert-container">
      <div className="cert-header">
        <h1 className="cert-title">CertiGranja</h1>
      </div>

      <div className="cert-content">
        <div className="resources-icons">
          <FaFileDownload
            className="download-icon-inline icon-verde"
            onClick={handleDownloadTemplate}
            title="Descargar Plantilla"
          />
          <FaBook className="download-icon-inline icon-verde" onClick={handleDownloadManual} title="Descargar Manual" />
        </div>

        <div className="folder-config">
          <div className="folder-header">
            <FaFolderPlus className="folder-icon" />
            <h2 className="folder-title">Ruta de la carpeta principal</h2>
          </div>
          <input
            type="text"
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            className="folder-input"
            placeholder="Ingresa la ruta de la carpeta"
            disabled={isLoading}
          />
        </div>

        <button onClick={handleStartProcess} className="cert-button" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Iniciar Procesamiento"}
        </button>

        {isLoading && (
          <div className="progress-section">
            {/* === Progreso de Carpetas === */}
            <div className="progress-card">
              <div className="progress-header">
                <FaFolder className="progress-icon" />
                <span className="progress-label">Progreso de Carpetas</span>
              </div>
              <div className="progress-content">
                <span className="progress-text">
                  Carpeta {carpetaActualIndex} de {totalCarpetas}
                </span>
                {carpetaActual && (
                  <div className="current-folder">
                    <span className="current-label">📂 {carpetaActual}</span>
                  </div>
                )}
              </div>
            </div>

            {/* === Progreso de Filas === */}
            <div className="progress-card">
              <div className="progress-header">
                <FaFileAlt className="progress-icon" />
                <span className="progress-label">Progreso de Filas</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-wrapper">
                  <progress value={progressFilas} max="100" className="progress-bar" />
                  <span className="progress-percentage">{progressFilas}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
