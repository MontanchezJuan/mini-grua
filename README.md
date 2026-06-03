# Mini Grua Webapp

Aplicacion para monitorear y controlar una mini grua con esta arquitectura:

```text
ESP32 / Arduino -> USB Serial -> Backend Node.js + TypeScript -> Frontend React + Vite + TypeScript
                                      |
                                      v
                              Firebase / Firestore
```

El proyecto Arduino es modular y usa `arduino/mini_grua.ino` junto con controladores como `ServoController`, `PS5ControllerCustom`, `RelayController`, `Buzzer`, `Ultrasonido`, `GasSensor` y `LDRSensor`. No se reemplaza por un sketch paralelo.

## Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Variables principales:

```env
SERIAL_PORT=COM3
BAUD_RATE=115200
SERVER_PORT=3001
FRONTEND_URL=http://localhost:5173

FIREBASE_ENABLED=false
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=
```

Tambien puedes usar credenciales por archivo:

```env
GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\service-account.json
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=tu-project-id
```

Si Firebase no esta configurado, el backend inicia igual y muestra un warning. La conexion serial y los WebSockets siguen funcionando.

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Variables:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ENABLE_DEV_TEST_PANEL=false
```

Para probar la interfaz sin Arduino:

```env
VITE_ENABLE_DEV_TEST_PANEL=true
```

El panel de desarrollo solo simula estados visuales en frontend. No reemplaza al Arduino. Para crear eventos persistidos de prueba se usa el endpoint backend `POST /api/events/test`, disponible solo fuera de produccion.

## Firestore

Coleccion usada:

```text
events
```

Los eventos guardan:

- tipo: `proximity`, `gas`, `light`, `ps5_recording`
- estado: `active` o `closed`
- origen: `arduino`, `web-test` o `ps5`
- inicio, fin, duracion en ms y segundos
- valor inicial, final, minimo, maximo, promedio y cantidad de muestras
- metadata con snapshot de sensores, salidas, servos y estado PS5

El backend no guarda lecturas crudas cada 500 ms. Guarda eventos por transicion:

- Proximidad inicia cuando `obstaculo` pasa de `false` a `true` y cierra cuando vuelve a `false`.
- Gas inicia cuando `gasDetectado` pasa de `false` a `true` y cierra cuando vuelve a `false`.
- Luz inicia cuando `pocaLuz` pasa de `false` a `true` y cierra cuando vuelve a `false`.
- Grabacion PS5 inicia cuando `grabando === true` o `ps5Mode === "GRABANDO"` y cierra cuando deja de estar grabando.

Firestore recibe escritura al iniciar y cerrar eventos. Las actualizaciones de eventos activos estan limitadas a una vez cada 5 segundos como maximo.

## Arduino

El JSON serial esperado incluye los campos base:

```json
{
  "distancia": 12.5,
  "gas": 80,
  "luz": 2400,
  "servoV": 95,
  "pocaLuz": false,
  "gasDetectado": false,
  "ventilador": false,
  "buzzer": false,
  "obstaculo": false,
  "servoBaseDir": 0,
  "ps5Mode": "NORMAL",
  "grabando": false,
  "reproduciendo": false,
  "framesGrabados": 0,
  "timestamp": 123456
}
```

Los campos PS5 se exponen con getters minimos en `PS5ControllerCustom`; la logica de grabacion y reproduccion no se reescribe.

## API REST

```text
GET  /api/health
GET  /api/latest
POST /api/command
GET  /api/database/health
GET  /api/events
GET  /api/events/:id
POST /api/events/test
```

Filtros de `GET /api/events`:

```text
type=proximity|gas|light|ps5_recording
status=active|closed
limit=50
from=ISO_DATE
to=ISO_DATE
```

`POST /api/events/test` es de desarrollo. En `NODE_ENV=production` responde como ruta no encontrada.

## Socket.IO

Eventos emitidos por backend:

```text
arduino:data
arduino:status
event:started
event:updated
event:closed
database:status
```

Eventos recibidos por backend:

```text
arduino:command
ping
```

## Dashboard

El frontend incluye:

- dashboard responsive con estilo tecnologico/industrial
- modo claro/oscuro controlado por `pocaLuz`, no por preferencias del navegador
- alerta visual por proximidad o buzzer
- alerta visual distinta por gas y ventilador
- banner de grabacion PS5 con punto REC, duracion y frames
- estado de reproduccion PS5
- historial de eventos con filtros y modal de detalle
- panel de desarrollo opcional para simular estados visuales sin hardware

## Si Arduino no esta conectado

El backend intenta conectar al puerto definido por `SERIAL_PORT`. Si falla, el servidor sigue levantando y `/api/health` muestra `serial.connected: false`.

Puedes usar `VITE_ENABLE_DEV_TEST_PANEL=true` para probar la interfaz visual. Los comandos a Arduino fallaran hasta que exista conexion serial.

## Si Firebase no esta configurado

El backend sigue funcionando. `/api/database/health` indica el motivo y el frontend muestra:

```text
Base de datos no configurada. Configura Firebase en el backend para ver el historial.
```

El dashboard en vivo sigue funcionando con Socket.IO aunque Firestore este deshabilitado.

## Build

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## Notas de seguridad

- No pongas credenciales reales en el repositorio.
- No conectes Firebase desde frontend.
- No guardes lecturas seriales crudas cada 500 ms en Firestore.
- No uses `analogWrite` directo para servos; usa `ServoController`.
- No reemplaces `mini_grua.ino` por otro sketch.
