import { FaInfoCircle, FaTimes, FaPlay, FaDatabase, FaRobot, FaFilePdf, FaBook, FaFileExcel, FaSearch, FaDownload, FaCogs } from "react-icons/fa"
import styles from "./infoModalNormal.module.css"

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* CABECERA DEL MODAL */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaInfoCircle className={styles.modalIcon} />
            ¿Cómo funciona CertiGranja?
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* CUERPO PRINCIPAL */}
        <div className={styles.modalBody}>
          
          {/* DESCRIPCIÓN GENERAL */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaCogs className={styles.stepIcon} />
              Sistema de CertiGranja
            </h3>
            <p className={styles.infoText}>
              <strong>CertiGranja</strong> es un sistema automatizado que descarga certificados de estado de cédula 
              desde la página oficial de la Registraduría Nacional del Estado Civil de Colombia. El sistema procesa 
              múltiples documentos de forma automática, ahorrando tiempo y esfuerzo en la gestión de certificados.
            </p>
          </div>

          {/* ESTRUCTURA DE PROCESAMIENTO */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaDatabase className={styles.stepIcon} />
              Procesamiento Automatizado
            </h3>
            <div className={styles.structureTypes}>
              <div className={styles.structureItem}>
                <strong>📊 Plantilla Excel:</strong> Archivo estructurado con los documentos a procesar
              </div>
              <div className={styles.structureItem}>
                <strong>📁 Carpeta Destino:</strong> Directorio personalizado para guardar los resultados
              </div>
              <div className={styles.structureItem}>
                <strong>🔍 Validación Automática:</strong> Verificación de formato y datos antes del procesamiento
              </div>
            </div>
          </div>

          {/* PROCESO AUTOMATIZADO */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaRobot className={styles.stepIcon} />
              Proceso de Automatización
            </h3>
            <div className={styles.processSteps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Validación Inicial:</strong> Verifica la plantilla Excel y el formato de los datos
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Navegación Automatizada:</strong> Accede automáticamente al portal de la Registraduría
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Consulta y Descarga:</strong> Realiza consultas individuales y descarga los certificados PDF
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Consolidación:</strong> Genera Excel final con todos los resultados del procesamiento
                </div>
              </div>
            </div>
          </div>

          {/* TIPOS DE DOCUMENTO SOPORTADOS */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Documentos Soportados
            </h3>
            <div className={styles.documentTypes}>
              <div className={styles.docType}><strong>CC:</strong> Cédula de Ciudadanía - Procesamiento automático completo</div>
              <div className={styles.docType}><strong>TI:</strong> Tarjeta de Identidad - Enlace a consulta manual en Registraduría</div>
              <div className={styles.docType}><strong>CE:</strong> Cédula de Extranjería - Enlace a consulta en Migración Colombia</div>
              <div className={styles.docType}><strong>PPT:</strong> Permiso Por Protección Temporal - Enlace a consulta en Migración Colombia</div>
            </div>
          </div>

          {/* INFORMACIÓN PROCESADA */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaDatabase className={styles.stepIcon} />
              Información Procesada
            </h3>
            <div className={styles.dataExtracted}>
              <div className={styles.dataItem}>• Validación de números de documento</div>
              <div className={styles.dataItem}>• Consulta de estado en registraduría</div>
              <div className={styles.dataItem}>• Descarga de certificados PDF</div>
              <div className={styles.dataItem}>• Generación de reporte consolidado</div>
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
                  <strong>Certificados PDF:</strong> Descarga individual de cada certificado en formato PDF
                </div>
              </div>
              <div className={styles.resultItem}>
                <FaFileExcel className={styles.resultIcon} />
                <div>
                  <strong>Excel Consolidado:</strong> Archivo único con todos los resultados del procesamiento
                </div>
              </div>
              <div className={styles.resultItem}>
                <FaSearch className={styles.resultIcon} />
                <div>
                  <strong>Validaciones Integradas:</strong> Resultados con estados de éxito, novedad o error
                </div>
              </div>
            </div>
          </div>

          {/* ESTADOS DE RESULTADO */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Estados de Resultado
            </h3>
            <div className={styles.resultSection}>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#00FF00" }}>ÉXITO</div>
                <div>
                  <strong>Descargado Correctamente:</strong> Certificado obtenido y guardado exitosamente
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FFFF00", color: "#000" }}>NOVEDAD</div>
                <div>
                  <strong>Con Observaciones:</strong> Documento presenta novedades en el registro oficial
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#FF0000" }}>FALLIDO</div>
                <div>
                  <strong>No Encontrado:</strong> El documento no existe en los registros consultados
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.statusBadge} style={{ backgroundColor: "#808080" }}>ERROR</div>
                <div>
                  <strong>Error en el Portal:</strong> Problema técnico durante la consulta en el portal oficial
                </div>
              </div>
            </div>
          </div>

          {/* INSTRUCCIONES DE USO */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaBook className={styles.stepIcon} />
              Instrucciones de Uso - Procesamiento Normal
            </h3>
            <ol className={styles.instructionList}>
              <li>Descarga la <strong>plantilla Excel</strong> del sistema</li>
              <li>Llena la plantilla con los <strong>datos requeridos</strong> de los documentos</li>
              <li>Escribe el <strong>nombre de la carpeta</strong> donde se guardarán los resultados</li>
              <li>Sube el archivo Excel completado al sistema</li>
              <li>Haz clic en <strong>"Iniciar Procesamiento"</strong></li>
              <li>Los <strong>resultados estarán en la carpeta Descargas</strong> especificada</li>
            </ol>
          </div>

          {/* FORMATOS SOPORTADOS */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaDatabase className={styles.stepIcon} />
              Formatos de Entrada
            </h3>
            <div className={styles.supportedFormats}>
              <div className={styles.formatItem}>
                <strong>📊 Archivos Excel:</strong> Plantilla específica con columnas predefinidas
              </div>
              <div className={styles.formatItem}>
                <strong>📝 Datos Estructurados:</strong> Números de documento en formato correcto
              </div>
              <div className={styles.formatItem}>
                <strong>📁 Carpetas Personalizadas:</strong> Directorios con nombres válidos en el sistema
              </div>
            </div>
          </div>

          {/* CONSIDERACIONES TÉCNICAS */}
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>🔧 Consideraciones Técnicas Importantes</h4>
            <ul className={styles.warningList}>
              <li>Requiere <strong>conexión a internet estable</strong> durante todo el proceso</li>
              <li>No cierres el <strong>navegador ni la aplicación</strong> durante el procesamiento</li>
              <li>Los datos deben ser <strong>exactos y coincidir</strong> con los registros oficiales</li>
              <li>El tiempo de procesamiento puede variar según la <strong>cantidad de documentos</strong></li>
              <li>Algunos tipos de documento requieren <strong>consulta manual</strong> en portales externos</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}