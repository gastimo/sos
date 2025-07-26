/* =============================================================================
 * 
 *       C O N E X I Ó N    C O N    L A    P A N T A L L A  -  N U B E
 * 
 * =============================================================================
 */


/**
 * prepararMensaje
 * Se construye el mensaje a ser enviado a "La Nube".
 * Este método incorpora información de control (ejemplo, el "IP")
 * extraida de la propia petición HTML para que "La Nube" pueda 
 * identificar al seguidor que originó el mensaje.
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
 * WEB SOCKET "ARROBAMIENTO" (puerto 8081)
 * Intermediario (web socket) entre la nube y sus seguidores.
 * Responsable de recibir y canalizar los mensajes de los 
 * siervos hacia la nube a través del protocolo OSC, durante
 * el ritual de arrobamiento y veneración.
 */
var osc = require('node-osc'),
    io  = require('socket.io').listen(8081);
var oscServer, oscClient;

io.on('connection', function (socket) {
  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer = new osc.Server(obj.server.port, obj.server.host);
    oscClient = new osc.Client(obj.client.host, obj.client.port);
    const _mensaje = prepararMensaje(socket, socket.id, process.env.OSC_DIRECCION_NUBE, process.env.OSC_MENSAJE_CONEXION);
    oscClient.send(..._mensaje);
    
    oscServer.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('Mensaje hacia LA NUBE.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    const _mensaje = prepararMensaje(socket, obj);
    oscClient.send(..._mensaje);
    console.log('Recibiendo mensaje de arrobamiento del SIERVO...', _mensaje);
  });
  
  socket.on("disconnect", function () {
    console.log("Un SIERVO se acaba de desconectar de la NUBE...");
    const _mensaje = prepararMensaje(socket, socket.id, process.env.OSC_DIRECCION_NUBE, process.env.OSC_MENSAJE_DESCONEXION);
    oscClient.send(..._mensaje);
    //oscServer.kill();
  });
});
