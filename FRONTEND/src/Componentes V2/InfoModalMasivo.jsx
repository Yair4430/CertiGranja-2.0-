import { FaInfoCircle, FaTimes, FaFolder, FaPlay, FaDatabase, FaRobot, FaFilePdf, FaBook } from "react-icons/fa"
import styles from "./InfoModalMasivo.module.css"

export default function InfoModalMasivo({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaInfoCircle className={styles.modalIcon} />
            ¿Cómo funciona el Proceso Masivo?
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* --- Descripción --- */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaPlay className={styles.stepIcon} />
              Descripción del Sistema
            </h3>
            <p className={styles.infoText}>
              El módulo masivo de <strong>CertiGranja</strong> permite procesar múltiples carpetas de forma
              automatizada. Cada carpeta debe contener un archivo Excel con la información de los documentos.
              El sistema recorre todas las subcarpetas, procesa cada Excel, descarga los certificados y
              finalmente genera un consolidado en PDF.
            </p>
          </div>

          {/* --- Estructura esperada --- */}
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

          {/* --- Proceso --- */}
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
                <div className={styles.stepContent}><strong>Navegación:</strong> Selenium automatiza la descarga de certificados.</div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}><strong>Unión:</strong> Combina certificados PDF en cada carpeta.</div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}><strong>Finalización:</strong> Carpeta procesada se marca con <code>_</code>.</div>
              </div>
            </div>
          </div>

          {/* --- Resultados --- */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Resultados del Proceso
            </h3>
            <div className={styles.resultTypes}>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#00FF00" }}>ÉXITO</div>
                <span>Certificados descargados y unidos correctamente.</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FFFF00", color: "#000" }}>NOVEDAD</div>
                <span>Algunos documentos con observaciones.</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FF0000" }}>FALLIDO</div>
                <span>No se encontraron documentos válidos.</span>
              </div>
              <div className={styles.resultType}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#808080" }}>ERROR</div>
                <span>Error durante la descarga o procesamiento.</span>
              </div>
            </div>
          </div>

          {/* --- Instrucciones --- */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaBook className={styles.stepIcon} />
              Instrucciones de Uso
            </h3>
            <ol className={styles.instructionList}>
              <li>Descarga la plantilla Excel.</li>
              <li>Llénala con los documentos requeridos.</li>
              <li>Crea una carpeta por cada grupo de datos.</li>
              <li>Coloca el Excel en cada subcarpeta.</li>
              <li>Selecciona la carpeta principal en la aplicación.</li>
              <li>Haz clic en "Iniciar Procesamiento".</li>
              <li>Los resultados estarán en las carpetas procesadas.</li>
            </ol>
          </div>

          {/* --- Advertencias --- */}
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>⚠️ Consideraciones Importantes</h4>
            <ul className={styles.warningList}>
              <li>Requiere conexión a internet estable.</li>
              <li>No cierres el navegador ni la aplicación durante el proceso.</li>
              <li>Los datos deben coincidir con los registros oficiales.</li>
              <li>El tiempo puede variar según la cantidad de carpetas.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
