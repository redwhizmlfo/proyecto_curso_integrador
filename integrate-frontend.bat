@echo off
echo ==============================================
echo Integrando React Frontend con Spring Boot...
echo ==============================================

echo [1/3] Compilando React Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error al compilar el frontend. Abortando.
    pause
    exit /b %errorlevel%
)
cd ..

echo [2/3] Limpiando archivos estaticos anteriores de Spring Boot...
if exist backend\src\main\resources\static (
    del /q /f backend\src\main\resources\static\* >nul 2>&1
    for /d %%x in (backend\src\main\resources\static\*) do rmdir /q /s "%%x" >nul 2>&1
) else (
    mkdir backend\src\main\resources\static
)

echo [3/3] Copiando nuevos recursos estaticos a Spring Boot...
xcopy /s /e /y frontend\dist\* backend\src\main\resources\static\

echo ==============================================
echo ¡Integracion completada con exito!
echo Los archivos de React ahora estan integrados en Spring Boot.
echo Ya puedes compilar tu JAR de Spring Boot (mvn clean package).
echo ==============================================
pause
