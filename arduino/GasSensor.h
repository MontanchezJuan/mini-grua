#pragma once

class GasSensor {
public:
    void begin();
    int  leer();                            // valor analógico promediado
    int  getValor() const { return _valor; }

private:
    int _valor = 0;
};