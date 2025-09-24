import { FaInfoCircle, FaTimes, FaFolder, FaPlay, FaDatabase, FaRobot, FaFilePdf, FaBook } from "react-icons/fa"
import styles from "./infoModalMasivo.module.css"

// Componente modal que muestra información detallada sobre el proceso masivo
export default function InfoModalMasivo({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* --- Encabezado del Modal --- */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaInfoCircle className={styles.modalIcon} />
            ¿Cómo funciona el Proceso Masivo?
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* --- Cuerpo del Modal - Contiene todas las secciones informativas --- */}
        <div className={styles.modalBody}>
          
          {/* Sección: Descripción general del sistema */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaPlay className={styles.stepIcon} />
              Descripción del Sistema
            </h3>
            <p className={styles.infoText}>
              El módulo masivo de <strong>CertiGranja</strong> permite procesar múltiples carpetas de forma
              automatizada. Cada carpeta debe contener un archivo Excel con la información de los documentos.
              El sistema recorre todas las subcarpetas, procesa cada Excel, descarga los certificados y
              finalmente genera el excel con los resultados de las descargas en cada subcarpeta.
            </p>
          </div>

          {/* Sección: Requisitos de estructura de carpetas */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFolder className={styles.stepIcon} />
              Estructura de Carpetas
            </h3>
            <p className={styles.infoText}>
              En la carpeta principal que selecciones, cada subcarpeta debe contener:
            </p>
            <ul className={styles.instructionList}>
              <li>Un archivo Excel válido con los documentos.</li>
              <li>El sistema procesará cada carpeta de forma independiente.</li>
              <li>Al finalizar, cada carpeta se renombrará con un guion bajo (<code>_</code>).</li>
            </ul>
          </div>

          {/* Sección: Pasos del proceso de automatización */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaRobot className={styles.stepIcon} />
              Proceso de Automatización
            </h3>
            <div className={styles.processSteps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}><strong>Búsqueda:</strong> Detecta subcarpetas y archivos Excel.</div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}><strong>Navegación:</strong> Automatiza la descarga de certificados.</div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}><strong>Finalización:</strong> Carpeta procesada se marca con <code>_</code>.</div>
              </div>
            </div>
          </div>

          {/* Sección: Tipos de resultados posibles */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Resultados del Proceso
            </h3>
            <div className={styles.resultTypes}>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#00FF00" }}>ÉXITO</div>
                <span>Certificados descargados</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FFFF00", color: "#000" }}>NOVEDAD</div>
                <span>Algunos documentos con observaciones, Perdida de documento o Fallecimiento por parte de la persona.</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FF0000" }}>FALLIDO</div>
                <span>No se encontraron documentos válidos.</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#808080" }}>ERROR</div>
                <span>Error durante la descarga o procesamiento por la pagina e la registraduria.</span>
              </div>
            </div>
          </div>

          {/* Sección: Instrucciones paso a paso para el usuario */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaBook className={styles.stepIcon} />
              Instrucciones de Uso
            </h3>
            <ol className={styles.instructionList}>
              <li>Descarga la plantilla Excel.</li>
              <li>Llénala con los documentos requeridos.</li>
              <li>Crea una carpeta General con sus subcarpetas.</li>
              <li>Coloca el Excel en cada subcarpeta.</li>
              <li>Escriba la ruta de la carpeta principal en el aplicativo.</li>
              <li>Haz clic en "Iniciar Procesamiento".</li>
              <li>Los resultados estarán en las carpetas procesadas.</li>
            </ol>
          </div>

          {/* Sección: Advertencias y consideraciones importantes */}
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>⚠️ Consideraciones Importantes</h4>
            <ul className={styles.warningList}>
              <li>Requiere conexión a internet estable.</li>
              <li>No cierres el navegador ni la aplicación durante el proceso.</li>
              <li>Los datos deben coincidir con los registros oficiales.</li>
              <li>El tiempo puede variar según la cantidad de datos rpocesados por carpeta.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}