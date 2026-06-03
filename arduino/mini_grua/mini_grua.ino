#include "Config.h"
#include "Ultrasonido.h"
#include "GasSensor.h"
#include "LDRSensor.h"
#include "Buzzer.h"
#include "RelayController.h"
#include "ServoController.h"
#include "PS5ControllerCustom.h"

Ultrasonido      ultrasonido;
GasSensor        gasSensor;
LDRSensor        ldrSensor;
Buzzer           buzzer;
RelayController  rele;
ServoController  servos;
PS5ControllerCustom controlPS5;

bool estadoVentilador = false;

// ── Web / Serial JSON ───────────────────────────────
const unsigned long INTERVALO_JSON = 500;
const unsigned long WEB_OVERRIDE_MS = 400;

unsigned long ultimoJSON = 0;
unsigned long ultimoComandoWebMovimiento = 0;

// ── Modos manuales desde la web ─────────────────────
bool ventiladorManual = false;
bool estadoVentiladorManual = false;

bool buzzerManual = false;
bool estadoBuzzerManual = false;

void setup() {
    Serial.begin(115200);
    Serial.setTimeout(20);

    rele.begin();
    ultrasonido.begin();
    gasSensor.begin();
    ldrSensor.begin();
    buzzer.begin();
    servos.begin();

    Serial.println("{\"evento\":\"inicio\",\"mensaje\":\"Sistema mini grua iniciado\"}");

    controlPS5.begin("A0:FA:9C:45:CE:11");

    Serial.println("{\"evento\":\"ps5\",\"mensaje\":\"Esperando control PS5\"}");
}

void loop() {
    procesarComandosWeb();

    float distancia = ultrasonido.medir();
    int   valorGas  = gasSensor.leer();
    ldrSensor.leer();

    bool obstaculo = distancia < DISTANCIA_PELIGRO;
    bool gasAlto = valorGas > UMBRAL_GAS_ENCENDER;
    bool gasBajo = valorGas < UMBRAL_GAS_APAGAR;

    // ── Buzzer ───────────────────────────────────────
    if (buzzerManual) {
        digitalWrite(BUZZER_PIN, estadoBuzzerManual ? HIGH : LOW);
    } else {
        buzzer.actualizar(distancia);
        estadoBuzzerManual = obstaculo;
    }

    // ── Lógica ventilador con prioridad obstáculo ────
    if (obstaculo) {
        estadoVentilador = false;
    } else if (ventiladorManual) {
        estadoVentilador = estadoVentiladorManual;
    } else {
        if (gasAlto) estadoVentilador = true;
        if (gasBajo) estadoVentilador = false;
    }

    // ── Relé ─────────────────────────────────────────
    estadoVentilador ? rele.encender() : rele.apagar();

    // ── Control PS5 ──────────────────────────────────
    // Evita que el PS5 sobrescriba inmediatamente un comando de la web.
    bool webTienePrioridad = millis() - ultimoComandoWebMovimiento < WEB_OVERRIDE_MS;

    if (!webTienePrioridad) {
        controlPS5.actualizar(distancia, estadoVentilador, servos, rele);
    }

    // ── JSON para backend/web ────────────────────────
    if (millis() - ultimoJSON >= INTERVALO_JSON) {
        enviarEstadoJSON(distancia, valorGas, obstaculo, gasAlto);
        ultimoJSON = millis();
    }

    delay(30);
}

void procesarComandosWeb() {
    if (!Serial.available()) return;

    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando.length() == 0) return;

    if (comando == "FAN_ON") {
        ventiladorManual = true;
        estadoVentiladorManual = true;
    }
    else if (comando == "FAN_OFF") {
        ventiladorManual = true;
        estadoVentiladorManual = false;
    }
    else if (comando == "FAN_AUTO") {
        ventiladorManual = false;
    }
    else if (comando == "BUZZER_ON") {
        buzzerManual = true;
        estadoBuzzerManual = true;
        digitalWrite(BUZZER_PIN, HIGH);
    }
    else if (comando == "BUZZER_OFF") {
        buzzerManual = true;
        estadoBuzzerManual = false;
        digitalWrite(BUZZER_PIN, LOW);
    }
    else if (comando == "BUZZER_AUTO") {
        buzzerManual = false;
    }
    else if (comando == "BASE_LEFT") {
        servos.girarIzquierda();
        ultimoComandoWebMovimiento = millis();
    }
    else if (comando == "BASE_RIGHT") {
        servos.girarDerecha();
        ultimoComandoWebMovimiento = millis();
    }
    else if (comando == "BASE_STOP") {
        servos.frenar();
        ultimoComandoWebMovimiento = millis();
    }
    else if (comando.startsWith("SERVO_VERTICAL:")) {
        int angulo = comando.substring(15).toInt();

        // Tu ServoController limita internamente entre 50 y 120.
        servos.setPos1(angulo);

        ultimoComandoWebMovimiento = millis();
    }
}

void enviarEstadoJSON(float distancia, int valorGas, bool obstaculo, bool gasAlto) {
    Serial.print("{");

    Serial.print("\"distancia\":");
    Serial.print(distancia, 1);

    Serial.print(",\"gas\":");
    Serial.print(valorGas);

    Serial.print(",\"luz\":");
    Serial.print(ldrSensor.getValor());

    Serial.print(",\"servoV\":");
    Serial.print(servos.getPos1());

    Serial.print(",\"pocaLuz\":");
    Serial.print(ldrSensor.pocaLuz() ? "true" : "false");

    Serial.print(",\"gasDetectado\":");
    Serial.print(gasAlto ? "true" : "false");

    Serial.print(",\"ventilador\":");
    Serial.print(rele.estaEncendido() ? "true" : "false");

    Serial.print(",\"buzzer\":");
    Serial.print((buzzerManual ? estadoBuzzerManual : obstaculo) ? "true" : "false");

    Serial.print(",\"obstaculo\":");
    Serial.print(obstaculo ? "true" : "false");

    Serial.print(",\"servoBaseDir\":");
    Serial.print(servos.getDireccionActual());

    Serial.print(",\"ventiladorManual\":");
    Serial.print(ventiladorManual ? "true" : "false");

    Serial.print(",\"buzzerManual\":");
    Serial.print(buzzerManual ? "true" : "false");

    Serial.print(",\"ps5Mode\":\"");
    Serial.print(controlPS5.getModoTexto());
    Serial.print("\"");

    Serial.print(",\"grabando\":");
    Serial.print(controlPS5.isGrabando() ? "true" : "false");

    Serial.print(",\"reproduciendo\":");
    Serial.print(controlPS5.isReproduciendo() ? "true" : "false");

    Serial.print(",\"framesGrabados\":");
    Serial.print(controlPS5.getFramesGrabados());

    Serial.print(",\"timestamp\":");
    Serial.print(millis());

    Serial.println("}");
}
