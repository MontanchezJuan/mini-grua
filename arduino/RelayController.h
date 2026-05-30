#pragma once

class RelayController {
public:
    void begin();
    void encender();
    void apagar();
    bool estaEncendido() const { return _encendido; }

private:
    bool _encendido = false;
};