import { ArduinoData } from "../types/arduino";

/**
 * Valida que un objeto sea un ArduinoData válido
 */
export function validateArduinoData(data: unknown): data is ArduinoData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Validar campos obligatorios y sus tipos
  return (
    typeof obj.distancia === "number" &&
    typeof obj.gas === "number" &&
    typeof obj.luz === "number" &&
    typeof obj.servoV === "number" &&
    typeof obj.pocaLuz === "boolean" &&
    typeof obj.gasDetectado === "boolean" &&
    typeof obj.ventilador === "boolean" &&
    typeof obj.buzzer === "boolean" &&
    typeof obj.obstaculo === "boolean"
  );
}

/**
 * Intenta parsear una línea JSON y devuelve los datos si es válida
 */
export function parseArduinoJSON(line: string): ArduinoData | null {
  if (!line || line.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(line);

    if (validateArduinoData(parsed)) {
      return parsed;
    }

    return null;
  } catch (error) {
    // Línea no es JSON válido o no contiene datos de sensor
    return null;
  }
}
