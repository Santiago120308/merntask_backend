import { emailAgregadoComoColaborador, emailEliminarColaborador } from "../helpers/email.js";
import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req , res) => {
    const proyectos = await Proyecto.find({
        $or : [
            {colaboradores: {$in : req.usuario}} ,
            {creador : {$in : req.usuario}}
        ]
    }).select("-tareas")

    res.json(proyectos); 
}

const nuevoProyecto = async (req , res) => {
    const proyecto = new Proyecto(req.body);
    
    proyecto.creador = req.usuario._id;


    try {

        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
        
    } catch (error) {
        console.log(error);
    }

} 

const obtenerProyecto = async (req , res) => {

    const {id} = req.params;
    console.log(id)

    if (id.length !== 24) { 
        const error = new Error("Id invalido");
        return res.json({msg : error.message})
     }

    const proyecto = await Proyecto.findById(id)
    .populate({path : "tareas" , populate : {path : "completado" ,  select : "nombre"} , populate : {path : "usuario" ,  select : "_id"}})
    .populate("colaboradores" , "nombre email");

    
    if(!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.json({msg : error.message})
    }

    if(req.usuario._id.toString() !== proyecto.creador.toString() 
    && !proyecto.colaboradores.some(colaborador => colaborador._id.toString()
    === req.usuario._id.toString())){
        const error = new Error("No tienes los permisos para ver esta informacion");
        return res.status(400).json({msg : error.message})
    }
 
    //Obtener las tareas del proyecto

   

    res.json(proyecto);
} 

const editarProyecto = async (req , res) => {
    const {id} = req.params;

    if(id.length !== 24){
        const error = new Error("Id no valido")
        return res.json({msg : error.message});
    }

    const proyecto = await Proyecto.findById(id)

    if(!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.json({msg : error.message})
    }

    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para ver esta informacion");
        return res.status(400).json({msg : error.message})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    proyecto.tareas = req.body.tareas || proyecto.tareas;
    
    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error)
    }

}

const eliminarProyecto = async (req , res) => {
    const {id} = req.params;

    if(id.length !== 24){
        const error = new Error("Id no valido")
        return set.json({msg : error.message});
    }

    const proyecto = await Proyecto.findById(id)

    if(!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.json({msg : error.message})
    }

    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para eliminar esta informacion");
        return res.json({msg : error.message})
    }

    try {
        await Tarea.deleteMany({proyecto : proyecto._id})
        await proyecto.deleteOne()
        
        res.json({msg : "Proyecto eliminado"})
    } catch (error) {
        console.loh(error)
    }
} 

const buscarColaborador = async (req , res) => {
    const {email} = req.body;

    const usuario = await Usuario.findOne({email})
    .select("-confirmado -createdAt -password -token -updatedAt -__v");
    



    if(!usuario){
        const error = new Error("El usuario no existe")
        return res.status(404).json({msg : error.message})
    }
    
    return res.json(usuario)
}

const agregarColaborador = async (req , res) => {
    const id = req.params.id;
    const {email} = req.body;

    //buscamos el proyecto 

    const proyecto = await Proyecto.findById(id)
    const usuario = await Usuario.findOne({email})

    if(!proyecto){
        const error = new Error("El proyecto no existe")
        return res.status(404).json({msg: error.message})
    }

    if(!usuario){
        const error = new Error("El usuario no existe")
        return res.status(404).json({msg: error.message})
    }

    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para agregar colaboradores");
        return res.status(400).json({msg : error.message})
    }

    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error("El creador del proyecto no puede ser un colaborador");
        return res.status(400).json({msg : error.message})
    }

    if(!usuario.confirmado){
        const error = new Error("El usuario no ha confirmado su cuenta")
        return res.status(400).json({msg : error.message})
    }
    
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El usuario ya ha sido agregado")
        return res.status(400).json({msg : error.message})
    }

    //agregamos colaborador 

    proyecto.colaboradores.push(usuario);
    await proyecto.save()
    emailAgregadoComoColaborador(usuario , proyecto)
    return res.status(200).json({msg : "Usuario agregado como colaborador"})
}

const eliminarColaborador = async (req , res) => {
    
    const id = req.params.id;
    const {col} = req.body
    
    //buscamos el proyecto 

    const proyecto = await Proyecto.findById(id)
    const usuario = await Usuario.findById(col)

    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg : error.message});
    }

    if(!proyecto){
        const error = new Error("El proyecto no existe")
        return res.status(404).json({msg: error.message})
    }


    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para eliminar esta informacion");
        return res.status(400).json({msg : error.message})
    }

    proyecto.colaboradores.pull(col)
    await proyecto.save()
    emailEliminarColaborador(usuario , proyecto)
    return res.status(200).json({msg : "Colaborador eliminado"})
}



export {
    obtenerProyecto , 
    editarProyecto ,
    obtenerProyectos , 
    nuevoProyecto ,
    eliminarProyecto ,
    eliminarColaborador ,
    agregarColaborador ,
    buscarColaborador
}
