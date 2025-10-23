import { FaInfoCircle, FaTimes, FaFolder, FaPlay, FaDatabase, FaRobot, FaFilePdf, FaBook, FaFileExcel, FaSearch, FaDownload, FaCogs } from "react-icons/fa"
import styles from "./infoModalMasivo.module.css"

// Componente modal que muestra información detallada sobre el proceso masivo
export default function InfoModalMasivo({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* --- CABECERA DEL MODAL --- */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaInfoCircle className={styles.modalIcon} />
            ¿Cómo funciona el Proceso Masivo?
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* --- CUERPO PRINCIPAL --- */}
        <div className={styles.modalBody}>
          
          {/* DESCRIPCIÓN GENERAL */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaCogs className={styles.stepIcon} />
              Sistema de Procesamiento Masivo
            </h3>
            <p className={styles.infoText}>
              El módulo masivo de <strong>CertiGranja</strong> permite procesar múltiples carpetas de forma
              automatizada. Cada carpeta debe contener un archivo Excel con la información de los documentos.
              El sistema recorre todas las subcarpetas, procesa cada Excel, descarga los certificados y
              finalmente genera el excel con los resultados de las descargas en cada subcarpeta.
            </p>
          </div>

          {/* ESTRUCTURA DE CARPETAS REQUERIDA */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFolder className={styles.stepIcon} />
              Estructura Requerida
            </h3>
            <div className={styles.structureTypes}>
              <div className={styles.structureItem}>
                <strong>📁 Subcarpetas:</strong> Cada subcarpeta debe contener un archivo Excel válido
              </div>
              <div className={styles.structureItem}>
                <strong>📊 Archivos Excel:</strong> Formato específico con información de documentos
              </div>
              <div className={styles.structureItem}>
                <strong>🔍 Procesamiento Individual:</strong> Cada carpeta se procesa de forma independiente
              </div>
            </div>
          </div>

          {/* PROCESO DE AUTOMATIZACIÓN */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaRobot className={styles.stepIcon} />
              Proceso de Automatización
            </h3>
            <div className={styles.processSteps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Búsqueda Inicial:</strong> Detecta subcarpetas y archivos Excel en el directorio principal
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Navegación Automatizada:</strong> Automatiza la descarga de certificados desde la página de la registraduría
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Procesamiento por Carpeta:</strong> Cada carpeta se procesa individualmente con su archivo Excel
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Finalización:</strong> Carpeta procesada se marca con <code>_</code> al final del nombre
                </div>
              </div>
            </div>
          </div>

          {/* TIPOS DE RESULTADOS */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Resultados del Proceso
            </h3>
            <div className={styles.resultSection}>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#00FF00" }}>ÉXITO</div>
                <div>
                  <strong>Certificados Descargados:</strong> Todos los documentos se procesaron correctamente
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FFFF00", color: "#000" }}>NOVEDAD</div>
                <div>
                  <strong>Documentos con Observaciones:</strong> Algunos documentos presentan novedades como pérdida de documento o fallecimiento
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FF0000" }}>FALLIDO</div>
                <div>
                  <strong>Sin Documentos Válidos:</strong> No se encontraron documentos válidos para procesar
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#808080" }}>ERROR</div>
                <div>
                  <strong>Error de Procesamiento:</strong> Error durante la descarga o procesamiento por la página de la registraduría
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN PROCESADA */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaDatabase className={styles.stepIcon} />
              Información Procesada
            </h3>
            <div className={styles.dataExtracted}>
              <div className={styles.dataItem}>• Validación de documentos desde archivos Excel</div>
              <div className={styles.dataItem}>• Descarga automatizada de certificados</div>
              <div className={styles.dataItem}>• Generación de resultados por cada carpeta procesada</div>
              <div className={styles.dataItem}>• Marcado de carpetas procesadas exitosamente</div>
            </div>
          </div>

          {/* RESULTADOS Y EXPORTACIÓN */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFileExcel className={styles.stepIcon} />
              Resultados y Exportación
            </h3>
            <div className={styles.resultSection}>
              <div className={styles.resultItem}>
                <FaDownload className={styles.resultIcon} />
                <div>
                  <strong>Certificados Descargados:</strong> Los certificados se descargan directamente en cada subcarpeta procesada
                </div>
              </div>
              <div className={styles.resultItem}>
                <FaDatabase className={styles.resultIcon} />
                <div>
                  <strong>Excel con Resultados:</strong> Cada carpeta genera un archivo Excel con el resumen de las descargas realizadas
                </div>
              </div>
              <div className={styles.resultItem}>
                <FaSearch className={styles.resultIcon} />
                <div>
                  <strong>Validaciones Integradas:</strong> El sistema incluye validaciones para asegurar la calidad del procesamiento
                </div>
              </div>
            </div>
          </div>

          {/* INSTRUCCIONES DE USO */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaBook className={styles.stepIcon} />
              Instrucciones de Uso - Procesamiento Masivo
            </h3>
            <ol className={styles.instructionList}>
              <li>Descarga la <strong>plantilla Excel</strong> proporcionada por el sistema</li>
              <li>Llena la plantilla con los <strong>documentos requeridos</strong> en el formato especificado</li>
              <li>Crea una <strong>carpeta general</strong> que contenga todas las subcarpetas a procesar</li>
              <li>Coloca el archivo Excel en <strong>cada subcarpeta</strong> individual</li>
              <li>Escribe la <strong>ruta de la carpeta principal</strong> en el aplicativo</li>
              <li>Haz clic en <strong>"Iniciar Procesamiento"</strong></li>
              <li>Los <strong>resultados estarán en las carpetas procesadas</strong> marcadas con guion bajo</li>
            </ol>
          </div>

          {/* FORMATOS SOPORTADOS */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFolder className={styles.stepIcon} />
              Formatos de Entrada Soportados
            </h3>
            <div className={styles.supportedFormats}>
              <div className={styles.formatItem}>
                <strong>📁 Carpetas:</strong> Estructura de subcarpetas con archivos Excel individuales
              </div>
              <div className={styles.formatItem}>
                <strong>📊 Archivos Excel:</strong> Formato específico con columnas definidas para el procesamiento
              </div>
              <div className={styles.formatItem}>
                <strong>🔄 Procesamiento Individual:</strong> Cada carpeta se procesa de forma independiente
              </div>
            </div>
          </div>

          {/* CONSIDERACIONES TÉCNICAS */}
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>🔧 Consideraciones Técnicas Importantes</h4>
            <ul className={styles.warningList}>
              <li>Requiere <strong>conexión a internet estable</strong> durante todo el proceso</li>
              <li>No cierres el <strong>navegador ni la aplicación</strong> durante el procesamiento</li>
              <li>Los datos deben <strong>coincidir con los registros oficiales</strong> de la registraduría</li>
              <li>El tiempo de procesamiento varía según la <strong>cantidad de datos por carpeta</strong></li>
              <li>El sistema es <strong>no bloqueante</strong> pero requiere supervisión constante</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}