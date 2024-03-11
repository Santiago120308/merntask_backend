import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import router from "./routes/usuarioRoutes.js";
import routerProyectos from "./routes/proyectoRoutes.js";
import routerTareas from "./routes/tareaRoutes.js";
import cors from 'cors'

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();


//cors

const whiteList = [process.env.FRONTED_URL , ];

const corsOptions = {
    origin : function(origin , callback){
        if(whiteList.includes(origin)){
            //Puede consultar la api
            callback(null , true);
        }else{
            callback(new Error("Error de Cors"))
        }
  }
}

app.use(cors(corsOptions));

//
//Rounting
app.use("/api/usuarios" , router);
app.use("/api/proyectos" , routerProyectos);
app.use("/api/tareas" , routerTareas);

console.log('desde index.js');

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT , () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

//Socket.io

import {Server} from 'socket.io'

const io = new Server(servidor , {
    pingTimeout : 60000 ,
    cors : {
        origin : process.env.FRONTED_URL
    }
});

//conexion

io.on("connection" , (socket) => {
   
    socket.on('abrir proyecto' , (proyecto) => {
        socket.join(proyecto)
    })

    socket.on('nueva tarea' , (tarea) => {
       
        socket.to(tarea.proyecto).emit('tarea agregada' , tarea)
    })

    socket.on('eliminar tarea' , envio => {
      
        socket.to(envio[0].proyecto).emit('tarea eliminada' , envio)
    })

    socket.on('editar Tarea' , envio => {
        socket.to(envio[0].proyecto).emit('tarea editada' , envio)
    })

    socket.on('completar tarea' , envio => {
        socket.to(envio[0].proyecto).emit('tarea completada' , envio)
    } )

    socket.on('eliminar colaborador' , proyectoActualizado => {
        socket.to(proyectoActualizado._id).emit('col eliminado' , proyectoActualizado)
    })
})