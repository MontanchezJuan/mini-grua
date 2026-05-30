# 🔍 VERIFICACIÓN DE INSTALACIÓN

Usa este checklist para verificar que todo está correctamente instalado.

## ✅ Verificación del Sistema

### Node.js

```bash
node --version      # Debe ser >= 16
npm --version       # Debe ser >= 8
```

**Esperado:**

```
v20.10.0
10.2.1
```

## ✅ Verificación del Backend

### 1. Dependencias instaladas

```bash
cd backend
npm list --depth=0
```

**Esperado:**

```
mini-grua-backend@1.0.0
├── @serialport/parser-readline@11.0.0
├── cors@2.8.5
├── dotenv@16.4.5
├── express@4.18.2
├── serialport@11.0.1
└── socket.io@4.7.2
```

### 2. Archivo .env configurado

```bash
cd backend
cat .env
```

**Esperado:**

```env
SERIAL_PORT=COM3      # o /dev/ttyUSB0 en Linux
BAUD_RATE=115200
SERVER_PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. TypeScript compila sin errores

```bash
cd backend
npm run build
```

**Esperado:**

```
$ tsc
# Sin output = sin errores
ls -la dist/
# Debe existir carpeta dist/ con index.js
```

### 4. Backend inicia correctamente

```bash
cd backend
npm run dev
```

**Esperado:**

```
[APP] Servidor iniciado en http://localhost:3001
[APP] Frontend URL: http://localhost:5173
[APP] Puerto serial: COM3 @ 115200 baud
```

O si Arduino no está conectado:

```
[APP] No se pudo conectar al Arduino, continuando sin él
[SERIAL] Reconectando en 3000ms (intento 1/5)
```

### 5. API Health check

En otra terminal:

```bash
curl http://localhost:3001/api/health
```

**Esperado:**

```json
{
  "status": "ok",
  "backend": "running",
  "serial": {
    "connected": false,
    "port": "COM3",
    "lastDataTime": null
  }
}
```

## ✅ Verificación del Frontend

### 1. Dependencias instaladas

```bash
cd frontend
npm list --depth=0
```

**Esperado:**

```
mini-grua-frontend@1.0.0
├── react@18.2.0
├── react-dom@18.2.0
├── socket.io-client@4.7.2
```

### 2. Archivo .env (opcional)

```bash
cd frontend
cat .env
# O .env.local o .env.development
```

**Esperado:**

```
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Build compila sin errores

```bash
cd frontend
npm run build
```

**Esperado:**

```
$ tsc && vite build
vite v5.0.8 building for production...
✓ 123 modules transformed.
dist/index.html                0.47 kB │ gzip:  0.28 kB
dist/assets/main-abc123.js    45.67 kB │ gzip: 14.23 kB
dist/assets/style-def456.css   5.12 kB │ gzip:  1.23 kB
```

### 4. Dev server inicia

```bash
cd frontend
npm run dev
```

**Esperado:**

```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

**Abrir en navegador:**

- URL: `http://localhost:5173`
- Debe cargar interfaz
- Mostrar estado de conexión "Desconectado"

## ✅ Verificación del Arduino

### 1. Librería ArduinoJSON instalada

En Arduino IDE:

- Sketch → Include Library → Manage Libraries
- Buscar: "ArduinoJSON"
- Instalar: ArduinoJSON by Benoit Blanchon (v6.x o superior)

### 2. Sketch cargado correctamente

En Arduino IDE:

- File → Open → `arduino/mini_grua_web_serial.ino`
- Verificar compilación: Sketch → Verify/Compile
- **Esperado:** Sin errores

### 3. Pines configurados correctamente

En el sketch, verificar:

```cpp
#define GAS_PIN 35
#define RELE_PIN 4
#define TRIG_PIN 27
#define ECHO_PIN 33
#define BUZZER_PIN 32
#define LDR_PIN 34
#define SERVO_VERTICAL_PIN 25
#define SERVO_BASE_PIN 26
```

### 4. Serial monitor recibe datos

Arduino IDE:

- Tools → Serial Monitor
- Baudrate: 115200
- **Esperado:** JSON cada 500ms:

```json
{"distancia":12.5,"gas":80,"luz":2400,...}
```

## ✅ Verificación de Integración

### 1. Backend recibe datos del Arduino

Consola backend:

```
[SERIAL] Puerto COM3 abierto
[SOCKET] Cliente conectado. Clientes activos: 1
[SERIAL] Datos recibidos: {"distancia":12.5,...}
[SOCKET] Emitiendo datos: arduino:data
```

### 2. Frontend conecta al backend

Consola del navegador (F12):

```
[Socket] Conectando a http://localhost:3001
[Socket] Conectado al backend
[Socket] Datos recibidos: {distancia: 12.5, ...}
```

### 3. Botones de control funcionan

Frontend:

- Hacer clic en "Encender Ventilador"
- Debería mostrar feedback: "Comando enviado"

Backend:

```
[SOCKET] Comando recibido: { type: 'FAN_ON' }
[SERIAL] Comando enviado: FAN_ON
```

Arduino:

```
Relé debería activarse
```

## 🚨 Problemas Comunes

### "Puerto serie no encontrado"

**Causa:** Puerto incorrecto en .env

**Solución:**

```bash
# Windows
Get-WmiObject Win32_SerialPort | Select-Object Name, Description

# Linux
ls /dev/ttyUSB* /dev/ttyACM*

# macOS
ls /dev/cu.usbserial* /dev/cu.usbmodem*
```

### "EADDRINUSE: address already in use :::3001"

**Causa:** Otro proceso usa puerto 3001

**Solución:**

```bash
# Windows
netstat -ano | findstr :3001
# Mata el proceso

# Linux/macOS
lsof -i :3001
kill -9 <PID>
```

### "Cannot find module 'serialport'"

**Causa:** npm install incompleto

**Solución:**

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### "Datos no se actualizan en frontend"

**Causa:** WebSocket no conecta

**Solución:**

1. Abre DevTools (F12)
2. Network → WS
3. Busca conexión a `/socket.io`
4. Si no está, verifica que backend está corriendo
5. Verifica FRONTEND_URL en backend/.env

### "ArduinoJSON no compila"

**Causa:** Librería no instalada

**Solución:**

1. Arduino IDE → Tools → Manage Libraries
2. Busca "ArduinoJSON"
3. Instala la versión más reciente (6.x)
4. Reinicia Arduino IDE

---

## 📊 Resumen de Puertos

| Servicio | Puerto              | Estado                |
| -------- | ------------------- | --------------------- |
| Backend  | 3001                | Debe estar abierto    |
| Frontend | 5173                | Debe estar abierto    |
| Serial   | COM3 (configurable) | Debe estar disponible |

## 🔗 URLs Importantes

| Función        | URL                                    |
| -------------- | -------------------------------------- |
| Health check   | http://localhost:3001/api/health       |
| Último dato    | http://localhost:3001/api/latest       |
| Enviar comando | POST http://localhost:3001/api/command |
| Frontend       | http://localhost:5173                  |

---

**Si todo está ✅ verde: ¡Lista para presentación!**
