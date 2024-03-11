import express from "express"

import {
    agregarTarea ,
    obtenerTarea ,
    actualizarTarea , 
    eliminarTarea ,
    cambiarEstado ,
} from "../controllers/TareaController.js"

import checkAuth from "../middleware/checkAuth.js"



const routerTareas = express.Router()

routerTareas.post("/" , checkAuth, agregarTarea);

routerTareas.route("/:id").get(checkAuth , obtenerTarea)
                          .put(checkAuth , actualizarTarea)
                          .delete(checkAuth ,eliminarTarea);

routerTareas.post("/estado/:id" , checkAuth , cambiarEstado);                          
                        

export default routerTareas;