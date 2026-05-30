# 🚀 QUICK START - Mini Grúa Web

## 5 Pasos para Empezar

### Paso 1: Preparar Arduino

1. Abre Arduino IDE
2. **Instala ArduinoJSON:**
   - Sketch → Include Library → Manage Libraries
   - Busca: "ArduinoJSON"
   - Instala (v6.x o superior)

3. **Carga el sketch:**
   - Abre: `arduino/mini_grua_web_serial.ino`
   - Sketch → Verify (compilar sin errores)
   - Conecta tu ESP32/Arduino por USB
   - Selecciona puerto en Tools → Port
   - Upload (cargar)

4. **Verifica en Serial Monitor:**
   - Tools → Serial Monitor
   - Baudrate: 115200
   - Deberías ver JSON cada 500ms:
     ```json
     {"distancia":12.5,"gas":80,...}
     ```

---

### Paso 2: Configurar Backend

1. **Abre terminal en carpeta `backend`:**

   ```bash
   cd backend
   ```

2. **Copia el archivo de configuración:**

   ```bash
   cp .env.example .env
   # En Windows:
   # copy .env.example .env
   ```

3. **Edita `.env` y busca SERIAL_PORT:**

   ```env
   SERIAL_PORT=COM3        # ← CAMBIA ESTO
   BAUD_RATE=115200
   SERVER_PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

   **¿Cuál es mi puerto?**
   - Windows: COM3, COM4, etc. (ver Device Manager)
   - Linux: /dev/ttyUSB0, /dev/ttyACM0
   - macOS: /dev/cu.usbserial-_, /dev/cu.usbmodem_

4. **Instala dependencias:**

   ```bash
   npm install
   ```

5. **Inicia backend:**

   ```bash
   npm run dev
   ```

   **Esperado:**

   ```
   [APP] Servidor iniciado en http://localhost:3001
   [SERIAL] Puerto COM3 abierto
   ```

---

### Paso 3: Configurar Frontend

1. **En otra terminal, ve a carpeta `frontend`:**

   ```bash
   cd frontend
   ```

2. **Instala dependencias:**

   ```bash
   npm install
   ```

3. **Inicia dev server:**

   ```bash
   npm run dev
   ```

   **Esperado:**

   ```
   ➜  Local:   http://localhost:5173/
   ```

---

### Paso 4: Abre la Web

**En tu navegador:**

```
http://localhost:5173
```

Deberías ver:

- 🟢 Backend conectado
- 🟢 Arduino conectado (si está enchufado)
- Botones de métricas
- Panel de control

---

### Paso 5: ¡Prueba!

1. **Haz clic en "Distancia"** → Ve el valor en grande
2. **Haz clic en "Encender Ventilador"** → Relé debería activarse
3. **Acerca un objeto** → Distancia baja, buzzer suena
4. **Abre consola (F12)** → Ve los datos en tiempo real

---

## 🎯 Resumen de Carpetas

| Carpeta     | Qué es               |
| ----------- | -------------------- |
| `arduino/`  | Código ESP32/Arduino |
| `backend/`  | Servidor Node.js     |
| `frontend/` | App React            |

---

## 📌 Comandos Principales

### Backend

```bash
npm run dev       # Modo desarrollo (hot reload)
npm run build     # Compilar TypeScript
npm start         # Ejecutar compilado
```

### Frontend

```bash
npm run dev       # Dev server en :5173
npm run build     # Build optimizado
npm run preview   # Ver build
```

---

## 🔗 URLs de Prueba

### Health Check

```bash
curl http://localhost:3001/api/health
```

Respuesta:

```json
{
  "status": "ok",
  "backend": "running",
  "serial": {
    "connected": true,
    "port": "COM3"
  }
}
```

### Ver Último Dato

```bash
curl http://localhost:3001/api/latest
```

### Enviar Comando

```bash
curl -X POST http://localhost:3001/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"FAN_ON"}'
```

---

## ✅ Checklist Final

- [ ] Arduino conectado por USB
- [ ] Serial Monitor muestra JSON
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Navegador muestra http://localhost:5173
- [ ] Estado muestra conexiones verdes
- [ ] Botones responden

---

## 🆘 Si algo falla

1. **Revisa archivos de log en consola**
2. **Consulta [README.md](./README.md) sección Troubleshooting**
3. **Usa [VERIFICACION.md](./VERIFICACION.md) como checklist**

---

## 🎓 Para Presentación Académica

La webapp es **lista para mostrar:**

- ✅ Interfaz moderna y responsiva
- ✅ Datos en tiempo real
- ✅ Control interactivo
- ✅ Estado de conexión claro
- ✅ Sin dependencias complejas

**Tiempo de setup:** 10-15 minutos  
**Requisito:** Node.js instalado

---

**¡Listo! Abre tu navegador y disfruta 🚀**
