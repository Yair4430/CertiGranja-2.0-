from selenium import webdriver
from dotenv import load_dotenv
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException, TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import time, traceback, os, glob, shutil
import pandas as pd

#Importacion de los componentes
from .leerExcel import leer_excel  
from .generarResultados import generar_resultados

# Cargar las variables de entorno
load_dotenv()

# Callback para progreso 
progreso_callback = None
detener_proceso = False

def detener_automatizacion():
    """Permite detener el proceso desde fuera (ej: Flask)."""
    global detener_proceso
    detener_proceso = True

def set_progreso_callback(callback):
    """Permite que app.py registre un callback para actualizar el progreso"""
    global progreso_callback
    progreso_callback = callback

def obtener_enlace_tipo_documento(tipo_documento: str) -> dict:
    """
    Retorna los enlaces correspondientes según el tipo de documento desde variables de entorno
    Para PPT retorna ambas opciones
    """
    enlaces = {
        "TI": {
            "nombre": "Tarjeta de Identidad",
            "enlaces": [os.getenv("URL_TI")]
        },
        "CE": {
            "nombre": "Cédula de Extranjería",
            "enlaces": [os.getenv("URL_CE")]
        },
        "PPT": {
            "nombre": "Permiso Por Protección Temporal",
            "enlaces": [
                os.getenv("URL_PPT_OPC1"),
                os.getenv("URL_PPT_OPC2")
            ]
        }
    }
    return enlaces.get(tipo_documento, {"nombre": tipo_documento, "enlaces": []})

def automatizar_navegacion(datos, carpeta_destino=None):
    global progreso_callback
    driver = None
    resultados = []

    total_filas = len(datos)
    fila_actual = 0

    # Inicializar progreso
    if progreso_callback:
        progreso_callback({"total": total_filas, "actual": 0, "finalizado": False})

    try:
        url = os.getenv("CERTIFICADO_URL")
        if not url:
            raise ValueError("Faltan variables de entorno en el archivo .env")

        # Parámetros configurables
        REINTENTOS_POR_FILA = int(os.getenv("REINTENTOS_POR_FILA", 50))
        RETRY_SLEEP_SECONDS = float(os.getenv("RETRY_SLEEP_SECONDS", 2.0))
        DOWNLOAD_WAIT_ITER = int(os.getenv("DOWNLOAD_WAIT_ITER", 10))
        DOWNLOAD_WAIT_SLEEP = float(os.getenv("DOWNLOAD_WAIT_SLEEP", 1.0))

        service = Service(ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        options.add_argument("--force-device-scale-factor=0.65")
        options.add_argument("--high-dpi-support=0.65")

        driver = webdriver.Chrome(service=service, options=options)
        driver.get(url)

        global detener_proceso
        detener_proceso = False

        while fila_actual < total_filas:
            if detener_proceso:
                print("⚠️ Proceso detenido manualmente por el usuario")
                break

            row = datos.iloc[fila_actual]
            tipo_documento = str(row["TIPO DE DOCUMENTO"]).strip().upper()

            # Manejo tipos especiales (CE, PPT, TI) - sin reintentos (solo registro)
            if tipo_documento in ["CE", "PPT", "TI"]:
                info_documento = obtener_enlace_tipo_documento(tipo_documento)
                nombre_documento = info_documento["nombre"]
                enlaces = info_documento["enlaces"]

                if tipo_documento == "PPT":
                    print(f"Fila {fila_actual + 1}: Tipo de documento {tipo_documento} - Agregando ambas opciones de PPT")
                    enlaces_texto = " | ".join([f"Opción {i+1}: {enlace}" for i, enlace in enumerate(enlaces)])
                    resultados.append({
                        "STATUS": "ENLACE_ESPECIAL",
                        "OBSERVACIONES": f"PPT - {nombre_documento}. Enlaces disponibles para descargar el certificado de vigencia: {enlaces_texto}"
                    })
                else:
                    print(f"Fila {fila_actual + 1}: Tipo de documento {tipo_documento} - Agregando enlace especial")
                    resultados.append({
                        "STATUS": "ENLACE_ESPECIAL",
                        "OBSERVACIONES": f"{tipo_documento} - {nombre_documento}. Enlace disponible para descargar el certificado de vigencia: {enlaces[0]}"
                    })

                fila_actual += 1
                if progreso_callback:
                    progreso_callback({"total": total_filas, "actual": fila_actual, "finalizado": False})
                continue

            # --- Bucle de reintentos para la fila actual ---
            intentos = 0
            success = False
            ultimo_exception = None

            while intentos < REINTENTOS_POR_FILA and not success:
                try:
                    intentos += 1
                    print(f"[Fila {fila_actual + 1}] Intento {intentos}/{REINTENTOS_POR_FILA}")

                    # Cargar la página de inicio rápidamente
                    driver.get(url)

                    # Si aparece el banner de "Al parecer se presentó algun problema!" -> lanzar Timeout para reintentar
                    try:
                        WebDriverWait(driver, 1).until(
                            EC.presence_of_element_located((By.XPATH, "//h3[text()='Al parecer se presentó algun problema!']"))
                        )
                        print(f"[Fila {fila_actual + 1}] Banner de error en la página detectado. Recargando y esperando antes del reintento...")
                        time.sleep(RETRY_SLEEP_SECONDS)
                        continue  # reintenta la misma fila
                    except TimeoutException:
                        pass  # no hay banner de error, seguimos

                    # Proceder con el flujo normal - click en "Expedición Certificado"
                    WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, "//a[text()='Expedición Certificado']"))
                    ).click()

                    # Completar form
                    WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_TextBox1"))
                    ).clear()
                    WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_TextBox1"))
                    ).send_keys(str(row["NUMERO DE DOCUMENTO"]))

                    Select(WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_DropDownList1"))
                    )).select_by_visible_text(str(row["DIA"]).zfill(2))

                    mes_normalizado = str(row["MES"]).capitalize()
                    Select(WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_DropDownList2"))
                    )).select_by_visible_text(mes_normalizado)

                    Select(WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_DropDownList3"))
                    )).select_by_visible_text(str(row["AÑO"]))

                    WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_TextBox2"))
                    ).clear()
                    WebDriverWait(driver, 1.5).until(
                        EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_TextBox2"))
                    ).send_keys("LANAP")

                    WebDriverWait(driver, 1.5).until(
                        EC.element_to_be_clickable((By.ID, "ContentPlaceHolder1_Button1"))
                    ).click()

                    # Dar tiempo a que la página procese y genere mensajes / pdf
                    time.sleep(0.5)

                    # Verificar mensaje específico (documento no encontrado, CAPTCHA, u otra novedad)
                    try:
                        mensaje_error = WebDriverWait(driver, 2).until(
                            EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_Label11"))
                        ).text
                        if "El número de documento no se encuentra en la base de datos" in mensaje_error:
                            print(f"[Fila {fila_actual + 1}] FALLIDO: {mensaje_error}")
                            resultados.append({
                                "STATUS": "FALLIDO",
                                "OBSERVACIONES": "Número de documento o fecha de expedición erróneas"
                            })
                            success = True
                            break
                        if "CAPTCHA" in mensaje_error:
                            print(f"[Fila {fila_actual + 1}] CAPTCHA detectado. Reintentando fila...")
                            time.sleep(RETRY_SLEEP_SECONDS)
                            continue  # reintentar
                    except TimeoutException:
                        # Ningún mensaje inmediato -> seguir
                        pass

                    # Hacer click nuevamente si hace falta para generar PDF
                    try:
                        WebDriverWait(driver, 3).until(
                            EC.element_to_be_clickable((By.ID, "ContentPlaceHolder1_Button1"))
                        ).click()
                    except Exception:
                        pass

                    # Verificar si hay novedad (mensaje mostrado)
                    try:
                        novedad_element = WebDriverWait(driver, 2).until(
                            EC.presence_of_element_located((By.ID, "ContentPlaceHolder1_Label11"))
                        )
                        if novedad_element.is_displayed():
                            texto_novedad = novedad_element.text.strip()
                            print(f"[Fila {fila_actual + 1}] NOVEDAD: {texto_novedad}")

                            # Esperar si el PDF igualmente se descargó
                            downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
                            pdf_filename_pattern = f"Certificado estado cedula {str(row['NUMERO DE DOCUMENTO'])}*.pdf"
                            pdf_path = None

                            for _ in range(DOWNLOAD_WAIT_ITER):
                                matches = glob.glob(os.path.join(downloads_folder, pdf_filename_pattern))
                                if matches:
                                    pdf_path = matches
                                    break
                                time.sleep(DOWNLOAD_WAIT_SLEEP)

                            # Si existe el PDF, moverlo igual
                            if pdf_path and carpeta_destino:
                                for file in pdf_path:
                                    try:
                                        shutil.move(file, carpeta_destino)
                                        print(f"[Fila {fila_actual + 1}] Certificado con novedad movido correctamente.")
                                    except Exception as mv_e:
                                        print(f"Error moviendo archivo con novedad: {mv_e}")

                            resultados.append({
                                "STATUS": "NOVEDAD",
                                "OBSERVACIONES": f"NOVEDAD: {texto_novedad}"
                            })
                            success = True
                            break

                    except TimeoutException:
                        pass

                    # Esperar a que aparezca el PDF en Downloads (varias iteraciones)
                    downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
                    pdf_filename_pattern = f"Certificado estado cedula {str(row['NUMERO DE DOCUMENTO'])}*.pdf"

                    pdf_path = None
                    for _ in range(DOWNLOAD_WAIT_ITER):
                        matches = glob.glob(os.path.join(downloads_folder, pdf_filename_pattern))
                        if matches:
                            pdf_path = matches
                            break
                        time.sleep(DOWNLOAD_WAIT_SLEEP)

                    if pdf_path:
                        print(f"[Fila {fila_actual + 1}] EXITO: Certificado descargado.")
                        resultados.append({
                            "STATUS": "EXITO",
                            "OBSERVACIONES": "Certificado generado correctamente"
                        })
                        if carpeta_destino:
                            for file in pdf_path:
                                try:
                                    shutil.move(file, carpeta_destino)
                                except Exception as mv_e:
                                    print(f"Error moviendo archivo: {mv_e}")
                        success = True
                        break
                    else:
                        # Si no se encontró el PDF, es probable que la página haya fallado; reintentar
                        print(f"[Fila {fila_actual + 1}] No se encontró PDF en Downloads. Reintentando fila (posible error de página).")
                        time.sleep(RETRY_SLEEP_SECONDS)
                        continue

                except (TimeoutException, WebDriverException, UnexpectedAlertPresentException) as e:
                    ultimo_exception = e
                    print(f"[Fila {fila_actual + 1}] Excepción en intento {intentos}: {repr(e)}")

                    # Manejo rápido del alert "Ese no es el CAPTCHA"
                    try:
                        alert = WebDriverWait(driver, 1).until(EC.alert_is_present())
                        alert_text = alert.text
                        print(f"[ALERTA DETECTADA] {alert_text}")

                        # Aceptar la alerta inmediatamente
                        alert.accept()
                        print("[INFO] Alerta aceptada automáticamente.")

                        # Si el texto menciona el CAPTCHA, recargar sin esperar
                        if "CAPTCHA" in alert_text.upper():
                            print("[INFO] CAPTCHA incorrecto, recargando página rápidamente...")
                            driver.get(url)
                            continue  # reintenta la misma fila enseguida

                    except Exception:
                        pass

                    # Pequeña espera mínima (solo si no era CAPTCHA)
                    time.sleep(0.5)
                    continue

            # Fin del bucle de reintentos por fila
            if not success:
                # Si no se logró luego de todos los intentos, registrar error de página
                msg = f"Se presentó un problema en la página tras {REINTENTOS_POR_FILA} intentos."
                if ultimo_exception:
                    msg += f" Última excepción: {repr(ultimo_exception)}"
                print(f"[Fila {fila_actual + 1}] ❌ {msg}")
                resultados.append({
                    "STATUS": "ERROR DE PAGINA",
                    "OBSERVACIONES": msg
                })

            # Finalmente, avanzar a la siguiente fila
            fila_actual += 1
            if progreso_callback:
                progreso_callback({"total": total_filas, "actual": fila_actual, "finalizado": False})

    except Exception as main_exception:
        print(f"Error general durante la ejecución: {main_exception}")
        traceback.print_exc()
    finally:
        if driver:
            print("Esperando unos segundos para asegurar descargas completas...")
            time.sleep(1)
            driver.quit()

        # Guardar resultados
        resultados_df = pd.DataFrame(resultados)

        if carpeta_destino:
            nombre_archivo = os.path.join(carpeta_destino, "resultados_certificados.xlsx")
        else:
            nombre_archivo = os.getenv("OUTPUT_FILE", "resultados_certificados.xlsx")

        generar_resultados(datos, resultados_df, nombre_archivo)

    # Finalizar progreso 
    if progreso_callback:
        progreso_callback({"total": total_filas, "actual": total_filas, "finalizado": True})

    return resultados

if __name__ == "__main__":
    archivo_usuario = input("Ingrese el nombre del archivo Excel con los datos: ")
    datos = leer_excel(archivo_usuario)
    if datos is not None:
        automatizar_navegacion(datos)