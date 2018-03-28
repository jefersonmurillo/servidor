exports.eventos=function(http){
  //paquete encargado del envio y recepcion de informacion entre el usuario web y el servidor de mensajes
  var io=require("socket.io")(http);
  //paquete encargado del uso de los socket-tcp
  var net = require('net');
 //paquete encargado del uso de ips
  var ip=require("ip");
  //----------------------------------------------------------------------------------------------------
      //codigo especifico para buscar el servidor de mensajes de manera dinamica
  //----------------------------------------------------------------------------------------------------
      //variable encargada de separar la ip donde esta el servidor web
      var res=ip.address().split(".");
      //variable donde se guarda el primer numero de la ip del servidor web
      var num1=res[0];
      //variable donde se guarda el segunda numero de la ip del servidor web
      var num2=res[1];
      //variable donde se guarda el tercera numero de la ip del servidor web
      var num3=0;
      //variable donde se guarda el cuarta numero de la ip del servidor web
      var num4=0;
      //variable donde se guarda la ip del servidor de mensajes que sera calculada
      var ip=null;
      //ciclo donde itera mientras no encuentra la ip
      var intervalo=setInterval(()=>{
        //variable donde se guarda la ip parcial
        var ips=num1+"."+num2+"."+num3+"."+num4;
        //variable donde se inicializa parcialmente un socket
        var aux1 = new net.Socket()
        //establecer conexion con el servidor de mensajes con un puerto y una ip parcial
        aux1.connect(3000, ips,()=>{
        //funcion que recibe datos del servidor parcialmente
          aux1.on("data",(data)=>{
        //variable para parsea datos del servidor a json parcialmente
            var obj=JSON.parse(data.toString("utf-8"));
        //condicion para validar si el json tiene el formato que se maneja en el sistema completo
            if(obj.tipo!=null){
        //se guarda en la ip global, la ip parcial
              ip=ips;
            }
        // variable para finalizar la conexion con el servidor de mensajes
            aux1.end();
        //llamar a la funcion cerrar
            cerrar();
          });
        })
        //funcion por si socket tiene algun error
        aux1.on("error",()=>{
        // variable para finalizar la conexion con el servidor de mensajes
          aux1.end();
        });
        //-----------------------------------
        //codigo para aumentar los dos ultimos digitos de la ip parcial
        //----------------------------------
        if(num4<=255){
          num4++;
        }else if(num3<=255){
          num3++;
          num4=0;
        }
        //-------------------------------------
      },1);
  //----------------------------------------------------------------------------------------------------
  //funcion cerrar
  //encarga de establecer la conexion con el servidor de mensajes y cerrar el ciclo que busca la ip dinamicamente
      function cerrar(){
          io.sockets.on('connection',function(socket){
            console.log("usuario web conectado");
            var id=null;
            var client = new net.Socket();
              client.connect(3000,ip);
              client.on('data', (data) => {
                var res=data.toString("utf-8");
                try {
                  var obj=JSON.parse(res);
                  if(obj.tipo==1){
                      id=obj.id;
                      socket.emit("recibirId",id);
                  }else if(obj.tipo==2 || obj.tipo==3){
                      socket.emit("recibirMensaje",obj);
                  }else if(obj.tipo==4){
                      socket.emit("recibirUsuarios",obj.usuarios);
                  }
                } catch(e) {
                  var res2=res.split("\n");
                  for (var i = 0; i < res2.length-1; i++) {
                      var obj=JSON.parse(JSON.stringify(res2[i]));
                     obj= JSON.parse(obj);
                      if(obj.tipo==1){
                          id=obj.id;
                          socket.emit("recibirId",id);
                      }else if(obj.tipo==2 || obj.tipo==3){
                          socket.emit("recibirMensaje",obj);
                      }else if(obj.tipo==4){
                          socket.emit("recibirUsuarios",obj.usuarios);
                      }
                  }
                }
             });
                  socket.on("enviarMensaje",(data)=>{
                    client.write(JSON.stringify(data));
                  });
                  socket.on("nombre",(data)=>{
                    client.write(JSON.stringify({tipo:1,nombre:data}));
                  });
             socket.on('disconnect', function(){
                  console.log('desconectado web desconectado');
                  client.end();
                  client=null;
              });
          });
        clearInterval(intervalo);
      }
}
