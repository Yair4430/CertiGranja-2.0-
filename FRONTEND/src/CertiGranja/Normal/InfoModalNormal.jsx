import { FaInfoCircle, FaTimes, FaPlay, FaDatabase, FaRobot, FaFilePdf, FaBook } from "react-icons/fa"
import styles from "./infoModalNormal.module.css"

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* CABECERA DEL MODAL: Contiene título y botón de cerrar */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaInfoCircle className={styles.modalIcon} />
            ¿Cómo funciona CertiGranja?
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* CUERPO PRINCIPAL: Secciones informativas organizadas por temas */}
        <div className={styles.modalBody}>
          
          {/* SECCIÓN DE DESCRIPCIÓN GENERAL: Explica el propósito del sistema */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaPlay className={styles.stepIcon} />
              Descripción del Sistema
            </h3>
            <p className={styles.infoText}>
              CertiGranja es un sistema automatizado que descarga certificados de estado de cédula desde la página
              oficial de la Registraduría Nacional del Estado Civil de Colombia. El sistema procesa múltiples documentos
              de forma automática, ahorrando tiempo y esfuerzo.
            </p>
          </div>

          {/* SECCIÓN DE TIPOS DE DOCUMENTO: Especifica los documentos compatibles y su tratamiento */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaDatabase className={styles.stepIcon} />
              Tipos de Documento Soportados
            </h3>
            <div className={styles.documentTypes}>
              <div className={styles.docType}><strong>CC:</strong> Procesamiento automático completo</div>
              <div className={styles.docType}><strong>TI:</strong> Enlace a consulta manual en Registraduría</div>
              <div className={styles.docType}><strong>CE:</strong> Enlace a consulta en Migración Colombia</div>
              <div className={styles.docType}><strong>PPT:</strong> Enlace a consulta en Migración Colombia</div>
            </div>
          </div>

          {/* SECCIÓN DEL PROCESO AUTOMATIZADO: Describe las etapas del flujo de trabajo */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaRobot className={styles.stepIcon} />
              Proceso de Automatización
            </h3>
            <div className={styles.processSteps}>
              <div className={styles.step}><span className={styles.stepNumber}>1</span><div className={styles.stepContent}><strong>Validación:</strong> Verifica la plantilla</div></div>
              <div className={styles.step}><span className={styles.stepNumber}>2</span><div className={styles.stepContent}><strong>Navegación:</strong> Automatiza el portal</div></div>
              <div className={styles.step}><span className={styles.stepNumber}>3</span><div className={styles.stepContent}><strong>Descarga:</strong> PDFs automáticos</div></div>
              <div className={styles.step}><span className={styles.stepNumber}>4</span><div className={styles.stepContent}><strong>Resultados:</strong> Excel consolidado</div></div>
            </div>
          </div>

          {/* SECCIÓN DE RESULTADOS: Explica los posibles estados de cada procesamiento */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaFilePdf className={styles.stepIcon} />
              Resultados del Proceso
            </h3>
            <div className={styles.resultTypes}>
              <div className={styles.resultType}><div className={styles.statusBadge} style={{ backgroundColor: "#00FF00" }}>ÉXITO</div><span>Descargado correctamente</span></div>
              <div className={styles.resultType}><div className={styles.statusBadge} style={{ backgroundColor: "#FFFF00", color: "#000" }}>NOVEDAD</div><span>Con observaciones</span></div>
              <div className={styles.resultType}><div className={styles.statusBadge} style={{ backgroundColor: "#FF0000" }}>FALLIDO</div><span>No encontrado</span></div>
              <div className={styles.resultType}><div className={styles.statusBadge} style={{ backgroundColor: "#808080" }}>ERROR</div><span>Error en el portal</span></div>
            </div>
          </div>

          {/* SECCIÓN DE INSTRUCCIONES: Guía paso a paso para usar el sistema */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionHeader}>
              <FaBook className={styles.stepIcon} />
              Instrucciones de Uso
            </h3>
            <ol className={styles.instructionList}>
              <li>Descarga la plantilla Excel</li>
              <li>Llénala con los datos</li>
              <li>Escribe el nombre de la carpeta</li>
              <li>Sube el archivo Excel</li>
              <li>Haz clic en "Iniciar Procesamiento"</li>
              <li>Los resultados estarán en Descargas</li>
            </ol>
          </div>

          {/* SECCIÓN DE ADVERTENCIAS: Consideraciones importantes para el usuario */}
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>⚠️ Consideraciones Importantes</h4>
            <ul className={styles.warningList}>
              <li>Requiere internet estable</li>
              <li>No cierres el navegador</li>
              <li>Datos exactos con registros oficiales</li>
              <li>Puede tardar según la cantidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}