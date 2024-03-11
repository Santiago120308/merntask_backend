import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";


const agregarTarea = async (req , res) => {

    const {proyecto} = req.body;
    const objeto = req.body;
    const email = req.body.usuario;
    const usuario = await Usuario.findOne({email});

    if(proyecto.length !== 24){
        const error = new Error("Id no valido")
        return res.json({msg : error.message});
    }

    const pro = await Proyecto.findById(proyecto);

    if(!pro) {
        const error = new Error("El proyecto de la tarea a asignar no existe");
        return res.status(404).json({msg : error.message})
    }

    if(pro.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("No puedes agregar tareas por falta de permisos");
        return res.status(400).json({msg : error.message})
    }
    
    objeto.usuario = usuario._id;
    const tarea = new Tarea(objeto);

    let tareaAlmacenada = await tarea.save();
    pro.tareas.push(tareaAlmacenada._id);
    await pro.save();
   const asig = await Tarea.findById(tareaAlmacenada._id).populate({
    path: 'usuario',
    select: 'email'
});
    console.log(asig)
    tareaAlmacenada = asig;
    //res.json(tareaAlmacenada);
    res.json(tareaAlmacenada)

}

const obtenerTarea = async (req , res) => {
     const {id} = req.params;

     if(id.length !== 24){
        const error = new Error("Id no valido")
        return res.json({msg : error.message});
    }

    if (!(await Tarea.findById(id))) {
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg : error.message});
    }

    const tarea = await Tarea.findById(id).populate("proyecto");


    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("No puedes agregar tareas por falta de permisos");
        return res.status(401).json({msg : error.message})
    }

    res.json(tarea);
}

const actualizarTarea = async (req , res) => {
    const {id} = req.params;

    if(id.length !== 24){
       const error = new Error("Id no valido")
       return res.json({msg : error.message});
   }

   if (!(await Tarea.findById(id))) {
       const error = new Error("La tarea no existe")
       return res.status(404).json({msg : error.message});
   }

   const tarea = await Tarea.findById(id).populate("proyecto");


   if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
       const error = new Error("No puedes actualizar tareas por falta de permisos");
       return res.status(401).json({msg : error.message})
   }



  const email = req.body.usuario;
  const usuario = await Usuario.findOne({email});
 
   tarea.nombre = req.body.nombre || tarea.nombre;
   tarea.descripcion = req.body.descripcion || tarea.descripcion;
   tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
   tarea.prioridad = req.body.prioridad || tarea.prioridad;
   
   tarea.usuario =  usuario._id;

   try {
    let tareaAlmacenada = await tarea.save();
    const asig = await Tarea.findById(tareaAlmacenada._id).populate({
        path: 'usuario',
        select: 'email'
    });
    tareaAlmacenada = asig;
    res.json(tareaAlmacenada);
   } catch (error) {
    console.log(error);
   } 
}

const eliminarTarea = async (req , res) => {

  const {id} = req.params;


  if(id.length !== 24){
    const error = new Error("Id no valido")
    return res.json({msg : error.message});
  }
 

  if( !(await Tarea.findById(id)) ){
    
    const error = new Error("La tarea no existe")
    return res.status(404).json({msg : error.message});
  }

  const tareaEliminada = await Tarea.findById(id).populate("proyecto");


   if(tareaEliminada.proyecto.creador.toString() !== req.usuario._id.toString()){
       const error = new Error("No puedes actualizar tareas por falta de permisos");
       return res.status(401).json({msg : error.message})
   }

  try {
    await tareaEliminada.deleteOne()
        res.json({msg : "Tarea eliminada"});
  } catch (error) {
    console.log(error);
  }
}

const cambiarEstado = async (req , res) => {
    const tarea = await Tarea.findById(req.params.id)

    if(!tarea ){
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg : error.message});
      }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
   await tarea.save();
  

   const tareaAlmacenada = await Tarea.findById(req.params.id)
    .populate({
        path: 'completado'
    })
    .populate({
        path: 'usuario',
        select: 'email'
    });
   return res.json(tareaAlmacenada);
}

export {
    agregarTarea ,
    obtenerTarea ,
    actualizarTarea , 
    eliminarTarea ,
    cambiarEstado ,
}