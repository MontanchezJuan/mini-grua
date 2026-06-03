#include "PS5ControllerCustom.h"
#include "Config.h"
#include "Arduino.h"

//  BEGIN 

void PS5ControllerCustom::begin(const char* mac) {
    ps5.begin(mac);
}


//  ACTUALIZAR 

void PS5ControllerCustom::actualizar(float distancia,
                                     bool  estadoVentilador,
                                     ServoController& servos,
                                     RelayController& rele) {
    if (!ps5.isConnected()) return;

    bool l1        = ps5.L1();
    bool circulo   = ps5.Circle();
    bool triangulo = ps5.Triangle();

    bool l1Pressed        = l1        && !_l1Anterior;
    bool l1Released       = !l1       && _l1Anterior;
    bool circuloPressed   = circulo   && !_circuloAnterior;
    bool trianguloPressed = triangulo && !_trianguloAnterior;

    _l1Anterior        = l1;
    _circuloAnterior   = circulo;
    _trianguloAnterior = triangulo;

    switch (_modo) {

        // ──────────────────────────────────────────────
        case NORMAL:

            if (l1Pressed) {
                _totalFrames      = 0;
                _frameActual      = 0;
                _volviendo        = false;
                _posInicialServo1 = servos.getPos1();

                // Frenar servo2 donde está → esa es la posición inicial
                servos.frenar();

                _modo = GRABANDO;
                Serial.println(">>> GRABANDO...");
            }

            else if (circuloPressed && _totalFrames > 0) {
                _frameActual = 0;
                _volviendo   = false;
                _ultimoFrame = millis();
                _modo        = REPRODUCIENDO;
                Serial.println(">>> REPRODUCIENDO...");
            }

            else {
                manejarNormal(distancia, estadoVentilador, servos);
            }
            break;

        // ──────────────────────────────────────────────
        case GRABANDO:

            if (l1Released) {
                _modo = NORMAL;
                Serial.print(">>> GRABACION TERMINADA — Frames: ");
                Serial.println(_totalFrames);
            } else {
                manejarGrabando(distancia, estadoVentilador, servos);
            }
            break;

        // ──────────────────────────────────────────────
        case REPRODUCIENDO:

            if (trianguloPressed) {
                Serial.println(">>> CANCELADO — volviendo al inicio");
                _volviendo   = true;
                _ultimoFrame = millis();
            }

            manejarReproduciendo(servos);
            break;
    }
}


//  MODO NORMAL 
void PS5ControllerCustom::manejarNormal(float distancia,
                                        bool  gasActivo,
                                        ServoController& servos) {
    int lx = ps5.LStickX();
    int ry = ps5.RStickY();

    if (distancia >= DISTANCIA_PELIGRO) _ladoBloqueado = 0;

    servos.updateVertical(ry);

    if (distancia < DISTANCIA_PELIGRO && _ladoBloqueado == 0) {
        if (servos.getDireccionActual() == 1) {
            _ladoBloqueado = 1;
            Serial.println("OBSTACULO DERECHA");
        } else if (servos.getDireccionActual() == 2) {
            _ladoBloqueado = 2;
            Serial.println("OBSTACULO IZQUIERDA");
        }
    }

    if (gasActivo) {
        servos.frenar();
        return;
    }

    if (abs(lx) > 60) {
        if (lx > 60) {
            if (_ladoBloqueado != 1) servos.girarDerecha();
            else { servos.frenar(); Serial.println("DERECHA BLOQUEADA"); }
        } else {
            if (_ladoBloqueado != 2) servos.girarIzquierda();
            else { servos.frenar(); Serial.println("IZQUIERDA BLOQUEADA"); }
        }
    } else {
        servos.frenar();
    }
}


//  MODO GRABANDO 
void PS5ControllerCustom::manejarGrabando(float distancia,
                                          bool  gasActivo,
                                          ServoController& servos) {
    manejarNormal(distancia, gasActivo, servos);

    if (_totalFrames < MAX_FRAMES) {
        _secuencia[_totalFrames].pos1      = servos.getPos1();
        _secuencia[_totalFrames].dirServo2 = servos.getDireccionActual();
        _totalFrames++;
    } else {
        _modo = NORMAL;
        Serial.println(">>> BUFFER LLENO — grabacion detenida");
    }
}


//  MODO REPRODUCIENDO 
void PS5ControllerCustom::manejarReproduciendo(ServoController& servos) {

    if (millis() - _ultimoFrame < 30) return;
    _ultimoFrame = millis();

    // ── Reproducción normal (hacia adelante) ─────────
    if (!_volviendo) {

        if (_frameActual >= _totalFrames) {
            Serial.println(">>> FIN — volviendo al inicio");
            _volviendo   = true;
            _frameActual = _totalFrames - 1;
            return;
        }

        Frame& f = _secuencia[_frameActual];
        servos.setPos1(f.pos1);

        switch (f.dirServo2) {
            case 1:  servos.girarDerecha();   break;
            case 2:  servos.girarIzquierda(); break;
            default: servos.frenar();         break;
        }

        _frameActual++;
    }

    // ── Reproducción inversa (volviendo al inicio) ────
    else {

        if (_frameActual < 0) {
            servos.frenar();
            servos.setPos1(_posInicialServo1);
            _modo = NORMAL;
            Serial.println(">>> DE VUELTA EN POSICION INICIAL");
            return;
        }

        Frame& f = _secuencia[_frameActual];
        servos.setPos1(f.pos1);

        // Invertir dirección del servo2
        switch (f.dirServo2) {
            case 1:  servos.girarIzquierda(); break;   // derecha → izquierda
            case 2:  servos.girarDerecha();   break;   // izquierda → derecha
            default: servos.frenar();         break;
        }

        _frameActual--;
    }
}