# 🏗️ Mini Grúa Web - Sistema de Control y Visualización

Aplicación web completa para visualizar y controlar una mini grúa basada en ESP32/Arduino a través de una interfaz moderna en tiempo real.

## 📋 Descripción del Proyecto

Este proyecto implementa una arquitectura completa:

```
ESP32/Arduino (JSON Serial) → Backend Node.js → Frontend React + Vite
```

### Características principales

- ✅ **Lectura de sensores en tiempo real** (ultrasónico, gas, LDR)
- ✅ **Visualización interactiva** de cada parámetro
- ✅ **Control manual remoto** (ventilador, buzzer, servos)
- ✅ **WebSockets** para comunicación en tiempo real
- ✅ **API REST** para consultas y comandos
- ✅ **Reconexión automática** si Arduino se desconecta
- ✅ **Interfaz responsiva** y moderna
- ✅ **TypeScript** en ambas capas
- ✅ **Manejo de errores** robusto

---

## 🏗️ Arquitectura

### Componentes

1. **Arduino/ESP32**
   - Lee sensores (distancia, gas, luz)
   - Controla actuadores (relé, buzzer, servos)
   - Envía datos en JSON por Serial
   - Recibe comandos por Serial

2. **Backend (Node.js + Express + Socket.IO)**
   - Lee puerto serial
   - Valida y parsea JSON
   - Emite datos por WebSocket
   - API REST para consultas y comandos
   - Manejo de reconexión

3. **Frontend (React + Vite + TypeScript)**
   - Conexión en tiempo real por WebSocket
   - Visualización de métricas
   - Panel de control interactivo
   - Estado de conexión

### Flujo de datos

```
Sensor → Arduino → Serial (JSON) → Backend → Socket.IO → Frontend (React)
                                  ↑
                                  ← Comandos (Socket.IO / REST)
```

---

## 🚀 Instalación

### Requisitos previos

- **Node.js** 16+ (para backend y frontend)
- **npm** o **yarn**
- **Arduino IDE** o **PlatformIO** (para cargar sketch en ESP32)
- **Python 3** (opcional, para ArduinoJSON)

### 1. Preparar Arduino/ESP32

#### Opción A: Usar ArduinoJSON (recomendado)

1. Abre Arduino IDE
2. Instala la librería **ArduinoJSON** v6+ (Sketch → Include Library → Manage Libraries)
3. Abre el sketch: `arduino/mini_grua_web_serial.ino`
4. Configura el puerto y la placa
5. **Importante:** Modifica los pines si es necesario (líneas 8-15)
6. Carga el sketch en tu ESP32

#### Configuración de pines

Dentro del archivo `.ino`, verifica estos pines:

```cpp
#define GAS_PIN 35              // Sensor MQ-7
#define RELE_PIN 4              // Relé del ventilador
#define TRIG_PIN 27             // Sensor ultrasónico TRIG
#define ECHO_PIN 33             // Sensor ultrasónico ECHO
#define BUZZER_PIN 32           // Buzzer
#define LDR_PIN 34              // Sensor de luz
#define SERVO_VERTICAL_PIN 25   // Servo vertical
#define SERVO_BASE_PIN 26       // Servo base
```

#### Umbral de configuración (opcional)

En el mismo archivo, ajusta si es necesario:

```cpp
#define UMBRAL_GAS_ENCENDER 150     // Nivel de gas para encender ventilador
#define UMBRAL_GAS_APAGAR 100       // Nivel de gas para apagar ventilador
#define DISTANCIA_PELIGRO 5         // cm - distancia mínima de seguridad
#define UMBRAL_LUZ_BAJA 1500        // Umbral para determinar poca luz
```

---

### 2. Instalación del Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar y editar variables de entorno
copy .env.example .env

# Editar .env con tu puerto serial
# En Windows: COM3, COM4, etc.
# En Linux: /dev/ttyUSB0, /dev/ttyACM0, etc.
# En macOS: /dev/cu.usbserial-*, /dev/cu.usbmodem*, etc.
```

**Archivo `.env` ejemplo:**

```env
SERIAL_PORT=COM3
BAUD_RATE=115200
SERVER_PORT=3001
FRONTEND_URL=http://localhost:5173
```

#### Descubrir puerto serial

**Windows PowerShell:**

```powershell
Get-WmiObject Win32_SerialPort | Select-Object Name, Description
# O usar: COM ports in Device Manager
```

**Linux:**

```bash
ls /dev/ttyUSB* /dev/ttyACM*
# O: dmesg | grep -i usb
```

**macOS:**

```bash
ls /dev/cu.usbserial* /dev/cu.usbmodem*
# O: system_profiler SPUSBDataType
```

---

### 3. Instalación del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno (opcional)
copy .env.example .env
```

---

## ▶️ Ejecución

### Opción 1: Modo desarrollo

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

El backend escuchará en `http://localhost:3001`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

El frontend abrirá en `http://localhost:5173`

### Opción 2: Build y producción

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 🧪 Pruebas

### Verificar conexión backend

```bash
# Health check
curl http://localhost:3001/api/health

# Respuesta esperada:
{
  "status": "ok",
  "backend": "running",
  "serial": {
    "connected": true,
    "port": "COM3",
    "lastDataTime": 1699999999999
  }
}
```

### Obtener último dato

```bash
curl http://localhost:3001/api/latest

# Respuesta esperada:
{
  "data": {
    "distancia": 12.5,
    "gas": 80,
    "luz": 2400,
    "servoV": 95,
    "pocaLuz": false,
    "gasDetectado": false,
    "ventilador": false,
    "buzzer": false,
    "obstaculo": false,
    "timestamp": 1699999999999
  },
  "receivedAt": 1699999999999
}
```

### Enviar comando

```bash
# Encender ventilador
curl -X POST http://localhost:3001/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"FAN_ON"}'

# Mover servo vertical a 45°
curl -X POST http://localhost:3001/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"SERVO_VERTICAL","value":45}'

# Respuesta esperada:
{
  "success": true,
  "message": "Comando \"FAN_ON\" enviado correctamente",
  "command": "FAN_ON"
}
```

---

## 📊 Formato de datos JSON

### Datos que envía Arduino

```json
{
  "distancia": 12.5, // cm (float)
  "gas": 80, // 0-4095 (int)
  "luz": 2400, // 0-4095 (int)
  "servoV": 95, // 0-180 (int)
  "pocaLuz": false, // boolean
  "gasDetectado": false, // boolean
  "ventilador": false, // boolean
  "buzzer": false, // boolean
  "obstaculo": false, // boolean
  "timestamp": 1699999999 // ms desde inicio (opcional)
}
```

### Comandos soportados

| Comando              | Descripción            | Ejemplo                |
| -------------------- | ---------------------- | ---------------------- |
| `FAN_ON`             | Encender ventilador    | `FAN_ON\n`             |
| `FAN_OFF`            | Apagar ventilador      | `FAN_OFF\n`            |
| `BUZZER_ON`          | Encender buzzer        | `BUZZER_ON\n`          |
| `BUZZER_OFF`         | Apagar buzzer          | `BUZZER_OFF\n`         |
| `SERVO_VERTICAL:45`  | Mover servo a 45°      | `SERVO_VERTICAL:45\n`  |
| `SERVO_VERTICAL:90`  | Mover servo a 90°      | `SERVO_VERTICAL:90\n`  |
| `SERVO_VERTICAL:135` | Mover servo a 135°     | `SERVO_VERTICAL:135\n` |
| `BASE_LEFT`          | Girar base a izquierda | `BASE_LEFT\n`          |
| `BASE_RIGHT`         | Girar base a derecha   | `BASE_RIGHT\n`         |
| `BASE_STOP`          | Detener base           | `BASE_STOP\n`          |

---

## 🔧 Troubleshooting

### "Puerto serial no encontrado"

**Causa:** El Arduino no está conectado o el puerto es incorrecto

**Solución:**

1. Verifica que el Arduino esté conectado por USB
2. Descubre el puerto usando los comandos arriba
3. Actualiza `SERIAL_PORT` en `.env`
4. Reinicia el backend

El backend continuará ejecutándose sin datos, mostrando `serial.connected: false`.

### "Puerto ocupado"

**Causa:** Otra aplicación usa el puerto (Arduino IDE, Serial Monitor, etc.)

**Solución:**

1. Cierra Arduino IDE o Serial Monitor
2. Desconecta y vuelve a conectar el Arduino
3. Intenta un puerto diferente
4. Reinicia tu PC

### "WebSocket no conecta"

**Causa:** El backend no está escuchando o hay problema de CORS

**Solución:**

1. Verifica que el backend esté corriendo: `http://localhost:3001/api/health`
2. Revisa la consola del backend para errores
3. Asegúrate que `FRONTEND_URL` en `.env` es correcto
4. Limpia el cache del navegador

### "Arduino desconectado"

**Causa:** El Arduino se desconectó físicamente o perdió conexión serial

**Comportamiento esperado:**

1. El backend intenta reconectar automáticamente (hasta 5 intentos)
2. El frontend muestra `serial: { connected: false }`
3. Los datos congelados continúan visibles
4. Los comandos fallan hasta que se reconecte

**Reconexión manual:**

```bash
# En Terminal del backend, presiona Ctrl+C y vuelve a ejecutar:
npm run dev
```

### "Datos no se actualizan"

**Causa:** Arduino no envía datos o JSON es inválido

**Solución:**

1. Verifica el Serial Monitor (Arduino IDE) para ver si envía datos
2. Asegúrate que envía JSON completo con `Serial.println()`
3. Revisa el baudrate: debe ser `115200` en ambos lados
4. Revisa la consola del backend para mensajes de validación

---

## 📁 Estructura del proyecto

```
mini-grua-webapp/
├── arduino/
│   └── mini_grua_web_serial.ino       # Sketch para ESP32/Arduino
│
├── backend/
│   ├── src/
│   │   ├── index.ts                   # Servidor principal
│   │   ├── serial/
│   │   │   └── serialService.ts       # Gestión del puerto serial
│   │   ├── socket/
│   │   │   └── socketService.ts       # Gestión de WebSocket
│   │   ├── types/
│   │   │   └── arduino.ts             # Tipos TypeScript
│   │   └── utils/
│   │       └── validateArduinoData.ts # Validación de JSON
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                   # Entrada React
│   │   ├── App.tsx                    # Componente principal
│   │   ├── App.css                    # Estilos principales
│   │   ├── types/
│   │   │   └── arduino.ts             # Tipos TypeScript
│   │   ├── hooks/
│   │   │   └── useArduinoSocket.ts    # Hook de WebSocket
│   │   ├── components/
│   │   │   ├── MetricButton.tsx       # Botón de métrica
│   │   │   ├── MetricPanel.tsx        # Panel de valor
│   │   │   ├── ControlPanel.tsx       # Panel de control
│   │   │   └── StatusCard.tsx         # Estado de conexión
│   │   └── styles/
│   │       ├── MetricButton.css
│   │       ├── MetricPanel.css
│   │       ├── ControlPanel.css
│   │       └── StatusCard.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md                          # Este archivo
```

---

## 🔒 Lógica de seguridad (Arduino)

El sketch implementa las siguientes protecciones automáticas:

1. **Buzzer automático** si distancia < 5 cm
2. **Ventilador desactiva** si hay obstáculo (distancia < 5 cm)
3. **Ventilador encendido** si gas > umbral alto (150)
4. **Ventilador apagado** si gas < umbral bajo (100)
5. **Estado de luz** evaluado en cada lectura
6. **Estado de gas** evaluado en cada lectura

---

## 📈 Posibles mejoras (no implementadas)

- [ ] Gráficos históricos con Chart.js
- [ ] Almacenamiento en base de datos (InfluxDB, MongoDB)
- [ ] Autenticación y autorización
- [ ] Dashboard de métricas avanzadas
- [ ] Exportación de datos a CSV/PDF
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Multiidioma
- [ ] Registro de eventos (logs)
- [ ] Control de permisos por usuario
- [ ] Alarmas configurables
- [ ] OTA (Over-The-Air) updates para Arduino

---

## 📝 Notas técnicas

### Baudrate

Este proyecto usa **115200 baud** por defecto. Asegúrate que coincida:

- Arduino: `Serial.begin(115200)`
- Backend: `BAUD_RATE=115200`

### WebSocket vs REST

- **WebSocket** (Socket.IO): Datos en tiempo real, eventos `arduino:data`
- **REST**: Consultas puntuales, endpoint `/api/latest`

El frontend usa principalmente WebSocket. El REST es auxiliar.

### Tipado fuerte

Tanto backend como frontend usan **TypeScript strict**. Todos los tipos están definidos explícitamente para evitar errores en tiempo de compilación.

### CORS

El backend permite CORS desde `FRONTEND_URL` definida en `.env`. Por defecto:

```env
FRONTEND_URL=http://localhost:5173
```

Para producción, cambia a tu dominio real.

---

## 📄 Licencia

MIT

---

## 👥 Autor

Proyecto de mini grúa con Arduino/ESP32 y control web en tiempo real.

**Última actualización:** Diciembre 2024
