import express from 'express'

import {
    obtenerProyecto , 
    editarProyecto ,
    obtenerProyectos , 
    nuevoProyecto ,
    eliminarProyecto ,
    eliminarColaborador ,
    agregarColaborador ,
    buscarColaborador

} from "../controllers/ProyectoController.js"

import checkAuth from '../middleware/checkAuth.js'

const routerProyectos = express.Router();


routerProyectos.route("/")
            .get(checkAuth , obtenerProyectos)
            .post(checkAuth , nuevoProyecto)


routerProyectos.route("/:id")
            .get(checkAuth , obtenerProyecto)
            .put(checkAuth , editarProyecto)
            .delete(checkAuth , eliminarProyecto)     
            
            
routerProyectos.post("/colaboradores" , checkAuth , buscarColaborador)
routerProyectos.post("/colaboradores/:id" , checkAuth , agregarColaborador);  
routerProyectos.post("/eliminar-colaborador/:id" , checkAuth , eliminarColaborador);          

export default routerProyectos;