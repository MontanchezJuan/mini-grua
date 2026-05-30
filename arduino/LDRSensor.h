#pragma once

class LDRSensor {
public:
    void begin();
    int  leer();
    bool pocaLuz() const { return _pocaLuz; }
    int  getValor() const { return _valor; }

private:
    int  _valor   = 0;
    bool _pocaLuz = false;
};