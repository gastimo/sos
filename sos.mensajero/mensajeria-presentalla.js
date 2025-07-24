/* =============================================================================
 * 
 *         C O N E X I Ó N    P A R A    L A    P R E S E N T A L L A
 * 
 * =============================================================================
 */


/**
 * prepararMensaje
 * Se construye el mensaje a ser enviado a "La Presentalla".
 * Este método incorpora información extraida de la propia petición 
 * HTML originada por el siervo para ser entregada como ofrenda 
 * digital y monitoreada desde "La Presentalla".
 */
const prepararMensaje = (socket, msj, dir, tipo) => {
    const _SEPARADOR = ' ';
    const _mensajeRecibido = msj.split(_SEPARADOR);
    const _cuerpoMensaje   = _mensajeRecibido.slice( dir ? 0 : 1);
    const _direccionOSC    = dir ? ['/' + dir + '/' + tipo] : [_mensajeRecibido[0]];
    const _identificacion  = ["DESCONOCIDA"];
    if (socket.hasOwnProperty("handshake") && socket.handshake.hasOwnProperty("address")) {
      _identificacion[0] = socket.handshake.address;
    }
    return [..._direccionOSC, ..._identificacion, ..._cuerpoMensaje];
};


/**
 * WEB SOCKET "PRESENTALLA" (puerto 8091)
 * Intermediario (web socket) entre los seguidores y la
 * pantalla principal para la colecta y el monitoreo en
 * línea de las ofrendas digitales ("La Presentalla").
 */
var osc = require('node-osc'),
    io  = require('socket.io').listen(8091);
var oscServer, oscClient;

io.on('connection', function (socket) {
  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer = new osc.Server(obj.server.port, obj.server.host);
    oscClient = new osc.Client(obj.client.host, obj.client.port);
    const _mensaje = prepararMensaje(socket, socket.id, process.env.OSC_DIRECCION_PRESENTALLA, process.env.OSC_MENSAJE_CONEXION);
    oscClient.send(..._mensaje);
    
    oscServer.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('Mensaje hacia LA PRESENTALLA.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    const _mensaje = prepararMensaje(socket, obj);
    oscClient.send(..._mensaje);
  });
  
  socket.on("disconnect", function () {
    console.log("Un SIERVO se acaba de desconectar de la PRESENTALLA...");
    //oscServer.kill();
  });
});