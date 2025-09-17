import os
import sys
from pathlib import Path

def crear_carpeta_en_descargas(nombre_carpeta):
    # Obtener la carpeta de Descargas del usuario
    carpeta_descargas = str(Path.home() / "Downloads")

    # Ruta completa de la nueva carpeta
    ruta_carpeta = os.path.join(carpeta_descargas, nombre_carpeta)

    try:
        # Crear la carpeta si no existe
        os.makedirs(ruta_carpeta, exist_ok=True)
        print(f"✅ Carpeta creada en: {ruta_carpeta}")
    except Exception as e:
        print(f"❌ Error al crear la carpeta: {e}")
        sys.exit(1)

if __name__ == "__main__":
    nombre = input("🗂️ Ingresa el nombre de la carpeta que deseas crear en Descargas: ")
    crear_carpeta_en_descargas(nombre)
