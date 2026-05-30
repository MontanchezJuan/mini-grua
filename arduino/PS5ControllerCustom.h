#pragma once
#include <ps5Controller.h>
#include "ServoController.h"
#include "RelayController.h"

// ── Máximo de frames grabables (~15 segundos a 30ms/frame) ──
#define MAX_FRAMES 500

struct Frame {
    int pos1;        // ángulo servo vertical
    int dirServo2;   // 0=stop 1=derecha 2=izquierda
};

enum ModoControl {
    NORMAL,
    GRABANDO,
    REPRODUCIENDO
};

class PS5ControllerCustom {
public:
    void begin(const char* mac);
    void actualizar(float distancia,
                    bool  estadoVentilador,
                    ServoController& servos,
                    RelayController& rele);

private:
    // ── Anti-obstáculo ───────────────────────────────
    int _ladoBloqueado = 0;

    // ── Grabación / reproducción ─────────────────────
    ModoControl   _modo        = NORMAL;
    Frame         _secuencia[MAX_FRAMES];
    int           _totalFrames = 0;
    int           _frameActual = 0;
    bool          _volviendo   = false;
    unsigned long _ultimoFrame = 0;

    // Posición inicial al comenzar grabación
    int _posInicialServo1;

    // Estado anterior de botones (para detectar flanco)
    bool _l1Anterior        = false;
    bool _circuloAnterior   = false;
    bool _trianguloAnterior = false;

    // ── Métodos privados ─────────────────────────────
    void manejarNormal      (float distancia, bool gasActivo, ServoController& servos);
    void manejarGrabando    (float distancia, bool gasActivo, ServoController& servos);
    void manejarReproduciendo(ServoController& servos);
};