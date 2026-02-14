@echo off

REM Levantar backend y frontend (asumiendo que npm run dev ya hace ambos)
start "" cmd /k "cd /d C:\Users\Yairg\OneDrive\Documentos\Proyectos\CertiGranja\FRONTEND && npm run dev"

REM Esperar un poco para que se levante el backend y frontend
timeout /t 5

REM Abrir el navegador automáticamente en la URL del frontend
start http://localhost:3000
