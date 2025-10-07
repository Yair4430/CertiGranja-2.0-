import { useState, useEffect, useRef } from "react"
import {FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaFileDownload, FaFolderOpen, FaUpload, FaInfoCircle } from "react-icons/fa"
import * as XLSX from "xlsx"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import styles from "./certiNormal.module.css"
import InfoModal from "./infoModalNormal"

const API_URL = import.meta.env?.VITE_API_URL

// Función auxiliar para mostrar alertas estilizadas
const showAlert = (type, title, text) => {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    background: "#ffffff",
    confirmButtonColor: "#16a34a",
    customClass: {
      popup: "rounded-xl shadow-lg",
      title: "font-bold text-lg",
      confirmButton: "px-4 py-2",
    },
  })
}

export default function CertiNormal({ isLoading, setIsLoading }) {
  // Estados para gestionar la carpeta, archivo y progreso
  const [nombreCarpeta, setNombreCarpeta] = useState("")
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [isUploaded, setIsUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [templateDownloaded, setTemplateDownloaded] = useState(false)
  const [manualDownloaded, setManualDownloaded] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)

  const fileInputRef = useRef(null)
  const intervalRef = useRef(null)

  // Efecto para prevenir cierre de página durante procesos activos
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLoading])

  // Función para descargar la plantilla Excel
  const handleDownloadTemplate = async () => {
    if (templateDownloaded) {
      showAlert("info", "Plantilla ya descargada", "Ya has descargado la plantilla anteriormente.")
      return
    }
    setTemplateDownloaded(true)

    try {
      const response = await fetch(`${API_URL}/descargar-plantilla`)
      if (!response.ok) throw new Error("No se pudo descargar la plantilla")

      // Crear descarga del archivo
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
      console.error("Error al descargar la plantilla:", error)
      setTemplateDownloaded(false)
      showAlert("error", "Error en la descarga", "Hubo un problema al descargar la plantilla. Inténtalo nuevamente.")
    }
  }

  // Función para validar y procesar archivo Excel seleccionado
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    setErrorMessage("")
    setFileName("")
    setIsUploaded(false)
    
    if (!selectedFile) {
      showAlert("warning", "Archivo no seleccionado", "Por favor selecciona un archivo antes de continuar.")
      return
    }

    // Validación de extensión del archivo
    const allowedExtensions = ["xls", "xlsx"]
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension || "")) {
      setErrorMessage("Formato inválido. Solo se permiten archivos Excel.")
      showAlert("error", "Formato no válido", "Selecciona un archivo Excel (.xls, .xlsx)")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    // Validación de tamaño del archivo
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setErrorMessage("Archivo demasiado grande.")
      showAlert("error", "Archivo demasiado grande", "El tamaño máximo permitido es de 5MB.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    // Lectura y validación del contenido Excel
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        
        // Validar que el Excel no esté vacío
        if (jsonData.length === 0) {
          setErrorMessage("El Excel está vacío. Por favor, suba un archivo con datos.")
          return
        }

        // Validar estructura de columnas requeridas
        const expectedHeaders = ["TIPO DE DOCUMENTO", "NUMERO DE DOCUMENTO", "NOMBRES Y APELLIDOS", "DIA", "MES", "AÑO"]
        const fileHeaders = Object.keys(jsonData[0])
        const isValidTemplate = expectedHeaders.every((header) => fileHeaders.includes(header))
        
        if (!isValidTemplate) {
          setErrorMessage("Este Excel no es admitido para este proceso.")
          return
        }

        // Archivo válido - actualizar estados
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

  // Función para crear carpeta en el servidor
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

  // Función para consultar el progreso del proceso al servidor
  const fetchProgress = async (setProgress, setIsLoading) => {
    try {
      const response = await fetch(`${API_URL}/progreso`)
      if (!response.ok) {
        console.error("Error en respuesta del progreso:", response.status)
        return "error"
      }

      const data = await response.json()
      console.log("[v0] Progreso recibido:", data)

      const { total, actual, finalizado, error } = data.filas || {}

      if (error) {
        console.error("Error del backend:", error)
        setIsLoading(false)
        return "error"
      }

      // Actualizar barra de progreso
      if (total > 0) {
        const porcentaje = Math.round((actual / total) * 100)
        setProgress(porcentaje)
        console.log("[v0] Progreso actualizado:", porcentaje + "%")
      }

      if (finalizado) {
        setIsLoading(false)
        return "finished"
      }

      return "running"
    } catch (error) {
      console.error("Error obteniendo progreso:", error)
      return "error"
    }
  }

  // Función para resetear el formulario y estados
  const resetForm = () => {
    setFile(null)
    setFileName("")
    setIsUploaded(false)
    setErrorMessage("")
    setProgress(0)
    setIsLoading(false)
    setNombreCarpeta("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Función principal para iniciar el proceso completo
  const handleUploadAndExecute = async () => {
    if (!file) {
      showAlert("warning", "Ningún archivo seleccionado", "Selecciona un archivo primero.")
      return
    }

    // Crear carpeta primero
    const carpetaCreada = await handleCrearCarpeta()
    if (!carpetaCreada) return

    // Confirmación final antes de iniciar
    const result = await Swal.fire({
      icon: "success",
      title: "Carpeta y Excel cargado",
      text: "La carpeta se creó correctamente. Presiona Aceptar para iniciar el proceso.",
      confirmButtonText: "Aceptar",
      background: "#ffffff",
      confirmButtonColor: "#16a34a",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "font-bold text-lg",
        confirmButton: "px-4 py-2",
      },
    })

    if (!result.isConfirmed) return

    // Configuración inicial del proceso
    setIsLoading(true)
    setProgress(0)

    try {
      // Subir archivo Excel al servidor
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch(`${API_URL}/subir-excel`, {
        method: "POST",
        body: formData,
      })
      if (!uploadResponse.ok) throw new Error("Error al subir el archivo")

      // Iniciar proceso de automatización
      const automationResponse = await fetch(`${API_URL}/iniciar-automatizacion`, {
        method: "POST",
      })
      if (!automationResponse.ok) throw new Error("Error en la automatización")

      console.log("Iniciando monitoreo del progreso")

      // Intervalo para monitorear el progreso
      intervalRef.current = setInterval(async () => {
        const status = await fetchProgress(setProgress, setIsLoading)

        if (status === "finished") {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          console.log("Proceso completado exitosamente")

          Swal.fire({
            icon: "success",
            title: "Proceso finalizado",
            text: "Los resultados ya están disponibles en la carpeta de descargas.",
            confirmButtonText: "Aceptar",
            background: "#ffffff",
            confirmButtonColor: "#16a34a",
            customClass: {
              popup: "rounded-xl shadow-lg",
              title: "font-bold text-lg",
              confirmButton: "px-4 py-2",
            },
          }).then(() => resetForm())
        } else if (status === "error") {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          console.log("Error en el proceso")

          showAlert(
            "error",
            "Error en el proceso",
            "Hubo un problema durante la automatización. Por favor, inténtalo nuevamente.",
          )
          setProgress(0)
          setIsLoading(false)
        }
      }, 1500)
    } catch (error) {
      // Manejo de errores de conexión
      console.error("Error al procesar:", error)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      showAlert("error", "Error de conexión", "No se pudo conectar con el servidor. Inténtalo nuevamente.")
      setProgress(0)
      setIsLoading(false)
    }
  }

  // Función para manejar arrastrar y soltar archivos
  const handleFileDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect({ target: { files: [droppedFile] } })
    }
  }

  // Función para detener el proceso en ejecución
  const handleStopProcess = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Si detienes ahora, el proceso no se completará correctamente.",
      showCancelButton: true,
      confirmButtonText: "Sí, detener",
      cancelButtonText: "No, continuar",
      background: "#ffffff",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#16a34a",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "font-bold text-lg",
        confirmButton: "px-4 py-2 font-semibold",
        cancelButton: "px-4 py-2 font-semibold",
      },
    })

    if (!result.isConfirmed) return

    try {
      // Solicitar detención al servidor
      const response = await fetch(`${API_URL}/detener-automatizacion`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("No se pudo detener el proceso")

      await Swal.fire({
        icon: "success",
        title: "Proceso detenido",
        text: "El proceso fue detenido exitosamente.",
        confirmButtonText: "Aceptar",
        background: "#ffffff",
        confirmButtonColor: "#16a34a",
        customClass: {
          popup: "rounded-xl shadow-lg",
          title: "font-bold text-lg",
          confirmButton: "px-4 py-2",
        },
      })

      // Resetear estados después de detener
      setIsLoading(false)
      setProgress(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      resetForm()
    } catch (error) {
      console.error("Error al detener proceso:", error)
      showAlert("error", "Error", "No se pudo detener el proceso. Inténtalo nuevamente.")
    }
  }

  // Renderizado de la interfaz
  return (
    <div className={styles.certContainer}>
      <div className={styles.certHeader}>
        <h1 className={styles.certTitle}>CertiGranja</h1>
      </div>

      <div className={styles.certContent}>
        {/* Iconos de recursos (descarga e información) */}
        <div className={styles.resourcesIcons}>
          <FaFileDownload className={styles.downloadIconInline} onClick={handleDownloadTemplate} title="Descargar Plantilla"/>
          <FaInfoCircle className={styles.downloadIconInline} onClick={() => setShowInfoModal(true)} title="Información de uso"/>
        </div>

        {/* Sección de configuración de carpeta */}
        <div className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>
            <FaFolderOpen className={styles.folderIcon} />
            Nombre de la Carpeta
          </h2>
          <div className={styles.folderSection}>
            <div className={styles.inputGroup}>
              <input type="text" placeholder="Ingresa el nombre de la carpeta" value={nombreCarpeta} onChange={(e) => setNombreCarpeta(e.target.value)} className={styles.inputCarpeta} disabled={isLoading} />
            </div>
          </div>
        </div>

        {/* Sección de carga de archivo Excel */}
        <div className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>
            <FaUpload className={styles.uploadIcon} />
            Cargar Archivo Excel
          </h2>
          <div className={styles.uploadSection}>
            <div
              className={`${styles.fileUploader} ${isUploaded ? styles.uploaded : ""} ${errorMessage ? styles.error : ""}`}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.currentTarget.classList.add(styles.dragOver)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.currentTarget.classList.remove(styles.dragOver)
              }}
              onDrop={handleFileDrop}
            >
              {/* Iconos de estado de carga */}
              {isUploaded ? (
                <FaCheckCircle className={`${styles.uploadIcon} ${styles.success} ${styles.uploadIconLarge}`} />
              ) : errorMessage ? (
                <FaExclamationTriangle className={`${styles.uploadIcon} ${styles.error} ${styles.uploadIconLarge}`} />
              ) : (
                <FaCloudUploadAlt className={`${styles.uploadIcon} ${styles.uploadIconLarge}`} />
              )}
              <div className={styles.uploadText}>
                {errorMessage ? errorMessage : fileName ? `${fileName}` : "Haz clic aquí o arrastra tu archivo Excel"}
              </div>
              {!errorMessage && !fileName && (
                <div className={styles.uploadSubtext}>Formatos soportados: .xls, .xlsx (máx. 5MB)</div>
              )}
              {fileName && !errorMessage && (
                <div className={`${styles.statusIndicator} ${styles.success}`}>
                  <FaCheckCircle />
                  Archivo cargado correctamente
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className={styles.fileInput} accept=".xls,.xlsx" disabled={isLoading}/>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.buttonRow}>
          <button onClick={handleUploadAndExecute} className={styles.certButton} disabled={isLoading}>
            {isLoading ? "Procesando..." : "Iniciar Procesamiento"}
          </button>

          {isLoading && (
            <button onClick={handleStopProcess} className={`${styles.certButton} ${styles.stopButton}`}> Detener Proceso </button>
          )}
        </div>

        {/* Sección de progreso (solo visible durante procesamiento) */}
        {isLoading && (
          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <FaFileDownload className={styles.progressIcon} />
                <span className={styles.progressLabel}>Progreso del Proceso</span>
              </div>
              <div className={styles.progressBarContainer}>
                <progress value={progress} max="100" className={styles.progressBar} />
                <span className={styles.progressText}>{progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
        {/* Modal de información */}
        <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </div>
  )
}