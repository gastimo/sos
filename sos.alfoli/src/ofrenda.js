/*
 * =============================================================================
 * 
 *                       M Ó D U L O    O F R E N D A
 * 
 * =============================================================================
 */
import Particula from './particula.js';

const DURACION_ENTRADA        = 12;         // En cuadros
const DURACION_MINIMA_OFRENDA = 6;          // En cuadros
const DURACIÓN_ENVIO          = 55;         // En cuadros
const POSICION_X_MIN          = 0.0001;
const POSICION_X_MAX          = 0.32;
const POSICION_Y_MIN          = 0.2;
const POSICION_Y_MAX          = 0.4;
const DATOS_OFRENDA = " ABCDEFGHIJKLMNÑOPQRSTUVWXYZ 1234567890 abcdefghijklmnñopqrstuvwxyz ¿!#$%&/ ()=?¡ ";


/**
 * Ofrenda
 * Ventana emergente conteniendo las ristra de datos
 * del siervo que son entregados como ofrenda.
 */
function Ofrenda(S, datos, recursos) {
    const _ventana       = recursos.GRAFICO.ventana;
    const _particula     = Particula(S);
    const _posHorizontal = S.O.S.aleatorio(POSICION_X_MIN, POSICION_X_MAX);
    const _posVertical   = S.O.S.aleatorio(POSICION_Y_MIN, POSICION_Y_MAX);
    const _posicionX     = S.O.S.Variador(_posHorizontal, _posHorizontal, DURACION_ENTRADA);
    const _posicionY     = S.O.S.Variador(1, _posVertical, DURACION_ENTRADA);
    const _vigente       = S.O.S.Variador(0, 1, DURACION_MINIMA_OFRENDA);
    const _escala        = S.O.S.Variador(1, 1);
    let   _textoOfrenda  = [];
    let   _destinoOfrenda;
    _iniciar();
    
    function _iniciar() {
        _particula.posicion(_posicionX.valor(), _posicionY.valor());
    }
    
    function reiniciar() {
        _vigente.reiniciar(0, 1, DURACION_MINIMA_OFRENDA);
    }
    
    function vigente() {
        return !_vigente.completado();
    }
    
    function entregada() {
        return _escala.valor() <= 0;
    }
    
    function desplegar(ancho, alto) {
        const MARGEN_IZQ_VENTANA  = 28;
        const LONGItUD_LINEA_MAX  = 57;
        const INCREMENTO_TEXTO_Y  = 24;
        const CANTIDAD_MAX_LINEAS = 13;
        
        if (vigente()) {
            _particula.posicion(_posicionX.valor(), _posicionY.valor());
        }
        else if (_destinoOfrenda) {
            let _dir = _particula.direccion(_destinoOfrenda);
            _particula.aceleracion(_dir.x * 0.00080, _dir.y * 0.0031);
            _particula.actualizar();
        }
        
        // BASE DE LA VENTANA DE OFRENDAS
        // Se dibuja el fondo y el marco de la ventana
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _ventana.background('#E6E8DA');
        _ventana.image(recursos.IMAGEN.marco.contenido(), 0, 0);
        
        // ENCABEZADO DE LA VENTANA
        // Se coloca la dirección IP del siervo en el borde superior
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _ventana.textFont(recursos.FUENTE.encabezado.contenido());
        _ventana.textAlign(S.O.S.P5.CENTER);
        _ventana.textSize(30);
        _ventana.fill('#2350B2');
        _ventana.text("OFRENDA DEL SIERVO " + datos.siervo, _ventana.width * 0.475, 32);
        
        // TÍTULO DEL CONTENIDO
        // Se coloca el título que hace referencia al "recaudador"
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _ventana.textFont(recursos.FUENTE.titulo.contenido());
        _ventana.textAlign(S.O.S.P5.LEFT);
        _ventana.textSize(20);
        _ventana.fill('#2350B2');
        _ventana.text("ENTIDAD RECAUDADORA", MARGEN_IZQ_VENTANA, 75);
        
        // TEXTO SUPERIOR
        // Se colocan los datos del recaudador ("user agent")
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _ventana.textFont(recursos.FUENTE.texto.contenido());
        _ventana.textAlign(S.O.S.P5.LEFT);
        _ventana.textSize(19);
        _ventana.fill('#2350B2');
        let _numeroDeLinea = 0;
        let _textoPosY = 102;
        for (let t = datos.recaudador; t.trim().length > 0; t = t.substring(LONGItUD_LINEA_MAX)) {
            _ventana.text(t.substring(0, LONGItUD_LINEA_MAX), MARGEN_IZQ_VENTANA, _textoPosY);
            _textoPosY += INCREMENTO_TEXTO_Y;
            _numeroDeLinea++;
        }
        _ventana.text("----------------------------------------------------------", MARGEN_IZQ_VENTANA, _textoPosY);
        _textoPosY += INCREMENTO_TEXTO_Y + 3;
        
        // TEXTO DE LA OFRENDA
        // Se termina de dibujar la "ristra" de datos que representa la ofrenda
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        _generarTextoOfrenda(CANTIDAD_MAX_LINEAS - _numeroDeLinea, LONGItUD_LINEA_MAX);
        for (let i = 0; i < _textoOfrenda.length; i++) {
            _ventana.text(_textoOfrenda[i], MARGEN_IZQ_VENTANA, _textoPosY);
            _textoPosY += INCREMENTO_TEXTO_Y;
        }
        
        // RENDER DE LA OFRENDA
        // Finalmente, se dibuja la ventana completa sobre la pantalla
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        S.O.S.P5.image(_ventana, _particula.posicion().x * ancho - (ancho/2),
                                _particula.posicion().y * alto  - (alto/2),
                                _ventana.width  * _escala.valor(), 
                                _ventana.height * _escala.valor());
    }
    
    function enviar(x, y) {
        _destinoOfrenda = Particula(S);
        _destinoOfrenda.posicion(x, y);
        _particula.velocidad(0, -0.007 + (0.28 - _posVertical)/44);
        _escala.reiniciar(1, 0, DURACIÓN_ENVIO);
    }
    
    function _generarTextoOfrenda(lineas, largo) {
        let _cant = Math.floor(Math.random() * 10) + 2;
        if (_textoOfrenda.length > 0) {
            let _ultimaLinea = _textoOfrenda[_textoOfrenda.length - 1];
            if (_ultimaLinea.length < largo - _cant) {
                _textoOfrenda[_textoOfrenda.length - 1] = _ultimaLinea + _textoAleatorio(_cant);
                return;
            }
        }
        if (_textoOfrenda.length > lineas) {
            let _nuevoTexto = [];
            for (let i = 1; i < _textoOfrenda.length; i++) {
                _nuevoTexto.push(_textoOfrenda[i]);
            }
            _textoOfrenda = _nuevoTexto;
        }
        _textoOfrenda.push(_textoAleatorio(_cant));
    }
    
    function _textoAleatorio(largo) {
        let _indice;
        let _res = "";
        const _longitud = DATOS_OFRENDA.length;
        for (let i = 0; i < largo; i++) {
            _indice = Math.floor(Math.random() * _longitud);
            _res += DATOS_OFRENDA.substr(_indice, 1);
        }
        return _res;
    }
    
    return {reiniciar,
            vigente, 
            entregada, 
            desplegar, 
            enviar};

}

export default Ofrenda;