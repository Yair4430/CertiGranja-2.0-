import os
import sys
import time
import pandas as pd

# Ruta base = carpeta BACKEND
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from V1.leerEXCEL import leer_excel
from V1.unir_certificados import unir_pdfs
from V1.navegacion import automatizar_navegacion, set_progreso_callback

progreso_carpetas_callback = None

def set_progreso_carpetas_callback(callback):
    """Permite que app.py registre un callback para actualizar el progreso de carpetas"""
    global progreso_carpetas_callback
    progreso_carpetas_callback = callback

def mostrar_progreso_filas(info):
    """
    Callback que muestra el progreso de filas en consola.
    """
    total = info.get("total", 0)
    actual = info.get("actual", 0)
    finalizado = info.get("finalizado", False)

    if not finalizado:
        print(f"   → Progreso filas: {actual}/{total} ({(actual/total*100) if total else 0:.1f}%)")
    else:
        print("   → Filas finalizadas ✅")

def procesar_carpeta(carpeta_path, indice, total, callback_filas=None):
    """
    Procesa una carpeta: busca Excel, corre la automatización y une PDFs.
    """
    print(f"\n[{indice}/{total}] Procesando carpeta: {carpeta_path}")
    
    if progreso_carpetas_callback:
        progreso_carpetas_callback({
            "total": total,
            "actual": indice,
            "finalizado": False,
            "carpeta_actual": os.path.basename(carpeta_path)
        })

    archivos_excel = [f for f in os.listdir(carpeta_path) if f.endswith((".xlsx", ".xls"))]
    if not archivos_excel:
        print(f"No se encontró Excel en {carpeta_path}, se omite.")
        return

    archivo_excel = os.path.join(carpeta_path, archivos_excel[0])
    print(f"Usando archivo: {archivo_excel}")

    datos = leer_excel(archivo_excel)
    if datos is None:
        print(f"Error leyendo Excel en {carpeta_path}")
        return

    if callback_filas:
        set_progreso_callback(callback_filas)
    else:
        set_progreso_callback(mostrar_progreso_filas)

    try:
        automatizar_navegacion(datos, carpeta_destino=carpeta_path)
    except Exception as e:
        print(f"Error procesando carpeta {carpeta_path}: {e}")
        return

    try:
        unir_pdfs(carpeta_path)
    except Exception as e:
        print(f"No se pudieron unir PDFs en {carpeta_path}: {e}")

    carpeta_final = carpeta_path + "_"
    try:
        os.rename(carpeta_path, carpeta_final)
        print(f"Carpeta procesada y renombrada: {carpeta_final}")
    except Exception as e:
        print(f"No se pudo renombrar carpeta {carpeta_path}: {e}")

def procesar_carpeta_principal(ruta_principal, callback_filas=None):
    """
    Procesa todas las subcarpetas dentro de una carpeta principal.
    """
    if not os.path.isdir(ruta_principal):
        raise ValueError("La ruta no es válida.")

    subcarpetas = [
        os.path.join(ruta_principal, d)
        for d in os.listdir(ruta_principal)
        if os.path.isdir(os.path.join(ruta_principal, d))
    ]

    if not subcarpetas:
        raise ValueError("No se encontraron subcarpetas en la ruta ingresada.")

    total = len(subcarpetas)
    print(f"\nSe encontraron {total} subcarpetas para procesar.")

    for i, carpeta in enumerate(subcarpetas, start=1):
        procesar_carpeta(carpeta, i, total, callback_filas)

    if progreso_carpetas_callback:
        progreso_carpetas_callback({
            "total": total,
            "actual": total,
            "finalizado": True,
            "carpeta_actual": "Todas las carpetas procesadas"
        })

    print("\nProceso masivo finalizado con éxito.")
