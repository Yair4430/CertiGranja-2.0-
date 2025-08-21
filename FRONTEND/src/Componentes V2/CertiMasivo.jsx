import { useState, useEffect, useRef } from "react"
import { FaCheckCircle, FaExclamationTriangle, FaFileDownload, FaBook, FaUpload, FaFolderPlus } from "react-icons/fa"
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

export default function CertiMasivo() {
  const [ruta, setRuta] = useState("")
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
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

  const handleDownloadTemplate = async () => {
    if (templateDownloaded) {
      showAlert("info", "Plantilla ya descargada", "Ya has descargado la plantilla anteriormente.")
      return
    }
    setTemplateDownloaded(true)

    try {
      const response = await fetch(`${API_URL}/descargar-plantilla`)
      if (!response.ok) throw new Error("No se pudo descargar la plantilla")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "plantilla.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showAlert("success", "Descarga exitosa", "La plantilla se ha descargado correctamente.")
    } catch (error) {
      setTemplateDownloaded(false)
      showAlert("error", "Error en la descarga", "Hubo un problema al descargar la plantilla.")
    }
  }

  const handleDownloadManual = () => {
    if (manualDownloaded) {
      showAlert("info", "Manual ya descargado", "Ya has descargado el manual anteriormente.")
      return
    }
    setManualDownloaded(true)
    const url = "/Manual de Usuario CertiGranja.pdf"
    const a = document.createElement("a")
    a.href = url
    a.download = "Manual de Usuario CertiGranja.pdf"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => {
      showAlert("success", "Descarga exitosa", "El manual de usuario se ha descargado correctamente.")
    }, 500)
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/progreso`)
      if (!response.ok) return "error"

      const data = await response.json()
      const { total, actual, finalizado, error } = data

      if (error) {
        setIsLoading(false)
        return "error"
      }

      if (total > 0) {
        const porcentaje = Math.round((actual / total) * 100)
        setProgress(porcentaje)
      }

      if (finalizado) {
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
      showAlert("warning", "Ruta no ingresada", "Por favor ingresa una ruta antes de continuar.")
      return
    }

    setIsLoading(true)
    setProgress(0)

    try {
      const response = await fetch(`${API_URL}/iniciar-automatizacion-masiva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruta }),
      })

      if (!response.ok) throw new Error("Error en la automatización masiva")

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
            confirmButtonColor: "#16a34a",
          }).then(() => setRuta(""))
        } else if (status === "error") {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          showAlert("error", "Error en el proceso", "Hubo un problema durante la automatización.")
          setProgress(0)
          setIsLoading(false)
        }
      }, 1500)
    } catch (error) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      showAlert("error", "Error de conexión", "No se pudo conectar con el servidor.")
      setProgress(0)
      setIsLoading(false)
    }
  }

  return (
    <div className="cert-container">
      <div className="cert-header">
        <h1 className="cert-title">CertiGranja</h1>
      </div>

      <div className="cert-content">
        {/* Íconos de descarga */}
        <div className="resources-icons">
          <FaFileDownload className="download-icon-inline icon-verde" onClick={handleDownloadTemplate} title="Descargar Plantilla" />
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

        {/* Botón de inicio */}
        <button onClick={handleStartProcess} className="cert-button" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Iniciar Procesamiento"}
        </button>

        {isLoading && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <progress value={progress} max="100" className="progress-bar" />
              <span className="progress-text">{progress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
