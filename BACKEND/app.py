import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
from waitress import serve
import logging
from pathlib import Path
import threading

progreso = {
    "carpetas": {
        "total": 0, 
        "actual": 0, 
        "finalizado": False,
        "carpeta_actual": ""
    },
    "filas": {
        "total": 0, 
        "actual": 0, 
        "finalizado": False
    },
}

# Modulos de la Version 1 
from CertiGranja.Normal.leerExcel import leer_excel
from CertiGranja.Normal.navegacion import automatizar_navegacion, set_progreso_callback, detener_automatizacion
from CertiGranja.Normal.plantilla import generar_plantilla
from CertiGranja.Normal.generarResultados import generar_resultados

# Modulos de la version 2
from CertiGranja.Masivo.navegacionMasivo import procesar_carpeta_principal, set_progreso_carpetas_callback, detener_automatizacion_masiva

logging.basicConfig(level=logging.DEBUG)

ruta_carpeta_descargas = None

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/progreso', methods=['GET'])
def obtener_progreso():
    """Devuelve el estado de progreso (carpetas y filas)."""
    return jsonify(progreso)


@app.route('/crear-carpeta-descargas', methods=['POST'])
def crear_carpeta_en_descargas():
    global ruta_carpeta_descargas
    try:
        data = request.get_json()
        nombre_carpeta = data.get('nombre')

        if not nombre_carpeta:
            return jsonify({"error": "No se proporcionó un nombre de carpeta"}), 400

        carpeta_descargas = str(Path.home() / "Downloads")
        ruta_carpeta = os.path.join(carpeta_descargas, nombre_carpeta)

        os.makedirs(ruta_carpeta, exist_ok=True)
        ruta_carpeta_descargas = ruta_carpeta

        return jsonify({"mensaje": f"Carpeta creada en: {ruta_carpeta}"}), 200

    except Exception as e:
        return jsonify({"error": f"No se pudo crear la carpeta: {str(e)}"}), 500


@app.route('/')
def home():
    return jsonify({"mensaje": "Servidor Flask funcionando correctamente"}), 200


@app.route('/subir-excel', methods=['POST'])
def subir_excel():
    if 'file' not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400

    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, "archivo_subido.xlsx")
    file.save(filepath)

    return jsonify({"mensaje": "Archivo recibido correctamente"}), 200


@app.route('/iniciar-automatizacion', methods=['POST'])
def iniciar_automatizacion():
    global ruta_carpeta_descargas, progreso

    filepath = os.path.join(UPLOAD_FOLDER, "archivo_subido.xlsx")

    if not os.path.exists(filepath):
        return jsonify({"error": "No hay archivo subido"}), 400

    datos = leer_excel(filepath)
    if datos is None:
        return jsonify({"error": "No hay datos para procesar"}), 400

    # --- Resetear progreso filas ---
    progreso["filas"] = {"total": len(datos), "actual": 0, "finalizado": False}

    def actualizar_progreso(data):
        progreso["filas"].update(data)

    set_progreso_callback(actualizar_progreso)

    def run_automatizacion():
        resultados = automatizar_navegacion(datos, carpeta_destino=ruta_carpeta_descargas)
        generar_resultados(
            datos, resultados,
            nombre_archivo_salida="resultados_certificados.xlsx",
            carpeta_destino=ruta_carpeta_descargas
        )
        progreso["filas"].update({"finalizado": True})

    threading.Thread(target=run_automatizacion, daemon=True).start()

    return jsonify({"mensaje": "Automatización iniciada en segundo plano"}), 200

@app.route('/detener-automatizacion', methods=['POST'])
def detener_automatizacion_endpoint():
    detener_automatizacion()
    return jsonify({"mensaje": "Automatización detenida correctamente"}), 200


@app.route('/descargar-plantilla', methods=['GET'])
def descargar_plantilla():
    ruta_plantilla = None
    try:
        # Generar plantilla temporal
        ruta_plantilla = generar_plantilla()
        
        if not os.path.exists(ruta_plantilla):
            return jsonify({"error": "No se pudo generar la plantilla"}), 500

        # Enviar el archivo y luego eliminarlo
        response = send_file(
            ruta_plantilla,
            as_attachment=True,
            download_name="plantilla.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # Eliminar el archivo después de enviarlo
        @response.call_on_close
        def remove_file():
            try:
                if os.path.exists(ruta_plantilla):
                    os.remove(ruta_plantilla)
                    print(f"Archivo temporal eliminado: {ruta_plantilla}")
            except Exception as e:
                print(f"Error eliminando archivo temporal: {e}")
        
        return response
        
    except Exception as e:
        # Limpiar en caso de error
        if ruta_plantilla and os.path.exists(ruta_plantilla):
            try:
                os.remove(ruta_plantilla)
            except:
                pass
        return jsonify({"error": f"Error generando plantilla: {str(e)}"}), 500

@app.route('/descargar-resultados', methods=['GET'])
def descargar_resultados():
    global ruta_carpeta_descargas
    if not ruta_carpeta_descargas:
        return jsonify({"error": "La carpeta de descarga no ha sido definida."}), 400

    archivo_resultados = os.path.join(ruta_carpeta_descargas, "resultados_certificados.xlsx")

    if not os.path.exists(archivo_resultados):
        return jsonify({"error": "El archivo no está disponible."}), 404

    return send_file(archivo_resultados, as_attachment=True)

@app.route('/iniciar-automatizacion-masiva', methods=['POST'])
def iniciar_automatizacion_masiva():
    global progreso
    data = request.get_json()
    ruta_principal = data.get("ruta")

    if not ruta_principal:
        return jsonify({"error": "No se proporcionó una ruta"}), 400

    try:
        subcarpetas = [
            os.path.join(ruta_principal, d)
            for d in os.listdir(ruta_principal)
            if os.path.isdir(os.path.join(ruta_principal, d))
        ]
    except Exception as e:
        return jsonify({"error": f"Error accediendo a la ruta: {str(e)}"}), 400

    progreso["carpetas"] = {
        "total": len(subcarpetas), 
        "actual": 0, 
        "finalizado": False,
        "carpeta_actual": "Iniciando proceso..."
    }
    progreso["filas"] = {"total": 0, "actual": 0, "finalizado": False}

    def actualizar_progreso_carpetas(data):
        progreso["carpetas"].update(data)
        # Resetear filas cuando cambia de carpeta
        if not data.get("finalizado", False):
            progreso["filas"] = {"total": 0, "actual": 0, "finalizado": False}
        # Si el proceso fue detenido, actualizar el estado
        if data.get("detenido", False):
            progreso["carpetas"]["finalizado"] = True
            progreso["carpetas"]["carpeta_actual"] = "Proceso detenido por el usuario"

    def actualizar_progreso_filas(data):
        progreso["filas"].update(data)

    set_progreso_carpetas_callback(actualizar_progreso_carpetas)

    def run_masivo():
        try:
            exito = procesar_carpeta_principal(ruta_principal, actualizar_progreso_filas)
            if not exito:
                progreso["carpetas"].update({
                    "finalizado": True, 
                    "carpeta_actual": "Proceso detenido por el usuario",
                    "detenido": True
                })
        except Exception as e:
            logging.error(f"Error en automatización masiva: {e}")
            progreso["carpetas"].update({
                "finalizado": True, 
                "error": str(e),
                "carpeta_actual": "Error en el proceso"
            })
            
    threading.Thread(target=run_masivo, daemon=True).start()

    return jsonify({"mensaje": "Automatización masiva iniciada en segundo plano"}), 200

@app.route('/detener-automatizacion-masiva', methods=['POST'])
def detener_automatizacion_masiva_endpoint():
    """Detiene la automatización masiva en curso"""
    try:
        detener_automatizacion_masiva()
        return jsonify({"mensaje": "Automatización masiva detenida correctamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al detener automatización masiva: {str(e)}"}), 500

if __name__ == '__main__':
    logging.info("Servidor iniciado en http://127.0.0.1:50400")
    serve(app, host="0.0.0.0", port=5000)
