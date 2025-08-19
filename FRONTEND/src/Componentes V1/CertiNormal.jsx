import { useState, useEffect, useRef } from "react"
import { FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaFileDownload, FaBook } from "react-icons/fa"
import * as XLSX from "xlsx"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import "./global.css"

const getApiUrl = () => {
  try {
    return import.meta.env?.VITE_API_URL || "http://localhost:5000"
  } catch (error) {
    return "http://localhost:5000"
  }
}

const API_URL = getApiUrl()

// 🔔 Nueva función de alerta con SweetAlert2
const showAlert = (type, title, text) => {
  Swal.fire({
    icon: type, // success | error | warning | info | question
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    background: "#f4f7f6",
    confirmButtonColor: "#28a745",
    customClass: {
      popup: "rounded-xl shadow-lg",
      title: "font-bold text-lg text-green-900",
      confirmButton: "px-4 py-2",
    },
  })
}

export default function CertiNormal() {
  const [nombreCarpeta, setNombreCarpeta] = useState("")
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [isUploaded, setIsUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [templateDownloaded, setTemplateDownloaded] = useState(false)
  const [manualDownloaded, setManualDownloaded] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isLoading) {
        event.preventDefault()
        event.returnValue = "El proceso aún está en ejecución. ¿Estás seguro de que quieres salir?"
        return event.returnValue
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
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
      const data = await response.json()
      const { archivo_base64, nombre } = data
      const byteCharacters = atob(archivo_base64)
      const byteNumbers = new Uint8Array(byteCharacters.length).map((_, i) => byteCharacters.charCodeAt(i))
      const blob = new Blob([byteNumbers], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setTimeout(() => {
        showAlert("success", "Descarga exitosa", "La plantilla se ha descargado correctamente.")
      }, 500)
    } catch (error) {
      console.error("Error al descargar la plantilla:", error)
      setTemplateDownloaded(false)
      showAlert("error", "Error en la descarga", "Hubo un problema al descargar la plantilla. Inténtalo nuevamente.")
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

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    setErrorMessage("")
    setFileName("")
    setIsUploaded(false)
    if (!selectedFile) {
      showAlert("warning", "Archivo no seleccionado", "Por favor selecciona un archivo antes de continuar.")
      return
    }
    const allowedExtensions = ["xls", "xlsx"]
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension || "")) {
      setErrorMessage("Formato inválido. Solo se permiten archivos Excel.")
      showAlert("error", "Formato no válido", "Selecciona un archivo Excel (.xls, .xlsx)")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setErrorMessage("Archivo demasiado grande.")
      showAlert("error", "Archivo demasiado grande", "El tamaño máximo permitido es de 5MB.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        if (jsonData.length === 0) {
          setErrorMessage("El Excel está vacío. Por favor, suba un archivo con datos.")
          return
        }
        const expectedHeaders = ["TIPO DE DOCUMENTO", "NUMERO DE DOCUMENTO", "NOMBRES Y APELLIDOS", "DIA", "MES", "AÑO"]
        const fileHeaders = Object.keys(jsonData[0])
        const isValidTemplate = expectedHeaders.every((header) => fileHeaders.includes(header))
        if (!isValidTemplate) {
          setErrorMessage("Este Excel no es admitido para este proceso.")
          return
        }
        setFile(selectedFile)
        setFileName(selectedFile.name)
        setIsUploaded(true)
        setErrorMessage("")
      } catch (error) {
        setErrorMessage("Error al leer el archivo Excel.")
        console.error("Error reading file:", error)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const handleCrearCarpeta = async () => {
    if (!nombreCarpeta.trim()) {
      showAlert("warning", "Nombre requerido", "Por favor ingresa un nombre de carpeta.")
      return false
    }
    try {
      const response = await fetch(`${API_URL}/crear-carpeta-descargas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreCarpeta.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "No se pudo crear la carpeta")
      showAlert("success", "Carpeta creada", data.mensaje)
      return true
    } catch (error) {
      console.error("Error al crear carpeta:", error)
      showAlert("error", "Error", error.message || "No se pudo crear la carpeta.")
      return false
    }
  }

const handleUploadAndExecute = async () => {
  if (!file) {
    showAlert("warning", "Ningún archivo seleccionado", "Selecciona un archivo primero.")
    return
  }

  const carpetaCreada = await handleCrearCarpeta()
  if (!carpetaCreada) return

  setIsLoading(true)
  setProgress(0)

  try {
    const formData = new FormData()
    formData.append("file", file)

    const uploadResponse = await fetch(`${API_URL}/subir-excel`, {
      method: "POST",
      body: formData,
    })
    if (!uploadResponse.ok) throw new Error("Error al subir el archivo")

    for (let i = 0; i <= 50; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const automationResponse = await fetch(`${API_URL}/iniciar-automatizacion`, {
      method: "POST",
    })
    if (!automationResponse.ok) throw new Error("Error en la automatización")

    for (let i = 50; i <= 100; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setIsLoading(false)
    setProgress(0)

    // 🔔 Aquí esperamos la confirmación del usuario
    Swal.fire({
      icon: "success",
      title: "Proceso finalizado",
      text: "El estado de los PDFs se encuentra en el archivo Excel dentro de la carpeta de descargas. Los PDFs se han generado correctamente.",
      confirmButtonText: "Aceptar",
      background: "#f4f7f6",
      confirmButtonColor: "#28a745",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "font-bold text-lg text-green-900",
        confirmButton: "px-4 py-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload()
      }
    })

  } catch (error) {
    console.error("Error al procesar:", error)
    showAlert("error", "Error de conexión", "No se pudo conectar con el servidor. Inténtalo nuevamente.")
    setProgress(0)
    setIsLoading(false)
  }
}

  return (
    <div className="cert-container">
      <img src="/Logo.png" alt="Logo CertiGranja" className="cert-logo" />
      <div className="cert-content">
        <div className="download-container">
          <div className="icon-wrapper" onClick={handleDownloadTemplate} title="Descargar Plantilla">
            <FaFileDownload className="download-icon" />
          </div>
          <div className="icon-wrapper" onClick={handleDownloadManual} title="Manual de Usuario">
            <FaBook className="download-icon" />
          </div>
        </div>
        <div className="carpeta-creator">
          <input
            type="text"
            placeholder="Nombre de la carpeta"
            value={nombreCarpeta}
            onChange={(e) => setNombreCarpeta(e.target.value)}
            className="input-carpeta"
            disabled={isLoading}
          />
        </div>
        <div
          className={`file-uploader ${isUploaded ? "uploaded" : ""} ${errorMessage ? "error" : ""}`}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          {isUploaded ? (
            <FaCheckCircle className="upload-icon success" />
          ) : errorMessage ? (
            <FaExclamationTriangle className="upload-icon error" />
          ) : (
            <FaCloudUploadAlt className="upload-icon" />
          )}
          <p>
            {errorMessage
              ? errorMessage
              : fileName
              ? `${fileName}, Recibido correctamente!`
              : "Por aquí puedes subir el Excel :)"}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="file-input"
            accept=".xls,.xlsx"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleUploadAndExecute} className="cert-button" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Cargar y Ejecutar"}
        </button>
        {isLoading && progress < 100 && (
          <div className="progress-bar-container">
            <progress value={progress} max="100" className="progress-bar" />
            <span>{progress}%</span>
          </div>
        )}
        {isLoading && <div className="spinner" />}
      </div>
    </div>
  )
}
