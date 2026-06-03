#include "ServoController.h"
#include "Config.h"
#include "Arduino.h"

// ======================================================
// ===== BEGIN ==========================================
// ======================================================
void ServoController::begin() {
    _servo1.attach(SERVO1_PIN);
    _servo1.write(_pos1);
}

// ======================================================
// ===== SERVO VERTICAL (control manual) ================
// ======================================================
void ServoController::updateVertical(int ry) {

    if (abs(ry) > 50) {
        int vel = map(ry, -127, 127, -3, 3);
        _pos1 += vel;
    }

    _pos1 = constrain(_pos1, 50, 120);

    if (_pos1 != _ultimaPos1) {
        _servo1.write(_pos1);
        Serial.print("Angulo Servo Vertical: ");
        Serial.println(_pos1);
        _ultimaPos1 = _pos1;
    }
}

// ======================================================
// ===== SERVO VERTICAL (reproducción directa) ==========
// ======================================================
void ServoController::setPos1(int pos) {
    _pos1 = constrain(pos, 50, 120);

    if (_pos1 != _ultimaPos1) {
        _servo1.write(_pos1);
        _ultimaPos1 = _pos1;
    }
}

// ======================================================
// ===== SERVO BASE — DERECHA ===========================
// ======================================================
void ServoController::girarDerecha() {

    if (!_servo2.attached()) {
        _servo2.attach(SERVO2_PIN);
    }

    _servo2.write(STOP_SERVO2 + VEL_SERVO2);
    _direccionActual = 1;
}

// ======================================================
// ===== SERVO BASE — IZQUIERDA =========================
// ======================================================
void ServoController::girarIzquierda() {

    if (!_servo2.attached()) {
        _servo2.attach(SERVO2_PIN);
    }

    _servo2.write(STOP_SERVO2 - VEL_SERVO2);
    _direccionActual = 2;
}

// ======================================================
// ===== SERVO BASE — FRENAR ============================
// ======================================================
void ServoController::frenar() {

    if (_servo2.attached()) {
        _servo2.write(STOP_SERVO2);
        delay(20);
        _servo2.detach();
    }

    _direccionActual = 0;
}