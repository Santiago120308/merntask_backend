import mongoose from "mongoose";
import generarId from "../helpers/generarId.js";
import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro , emailRecuperarPassword} from "../helpers/email.js";


const registrar = async (req , res) => {

    //Evitar registros duplicados 

    const {email} = req.body;
    const existeUsuario = await Usuario.findOne({email});

    if(existeUsuario) { 
        const error = new Error("Usuario ya registrado")
        return res.status(400).json({msg : error.message})
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        const usuarioAlmacenado = await usuario.save();

        //Enviar email al usuario 


        emailRegistro({
            nombre : usuario.nombre ,
            email : usuario.email ,
            token : usuario.token ,
        })

        res.json({
            msg : "Usuario creado correctamente , Revisa tu email para confirmar tu cuenta"
        });
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req , res) => {

    const {email , password} = req.body;

    // comprobar si el usuario existe 

    const usuario = await Usuario.findOne({email});

    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg : error.message});
    }

    //comprabar si el usuario esta confirmado

    if(!usuario.confirmado){
        const error = new Error("El usuario no esta confirmado");
        return res.status(403).json({msg : error.message});
    }

    if(await usuario.comprobarPassword(password)) { 
        
       return res.json({
        _id : usuario._id , 
        nombre : usuario.nombre , 
        email : usuario.email ,
        token : generarJWT(usuario._id)
       }) 
    }else { 
        const error = new Error("Contraseña incorrecta");
        return res.status(403).json({msg : error.message});
    }
    
}

const confirmar = async (req , res) => {
    const {token} = req.params;

    const usuarioConfirmar = await Usuario.findOne({token});

    if(!usuarioConfirmar){
        const error = new Error("El token no es valido");
        return res.status(403).json({msg : error.message});
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        await usuarioConfirmar.save()
        res.json({msg : "Usuario Confirmado Correctamente"})
    } catch (error) {
        console.log(error)
    }
       
    
}

const olvidePassword = async (req , res) => {

    const {email} = req.body;

      // comprobar si el usuario existe 

      const usuario = await Usuario.findOne({email});

      if(!usuario){
          const error = new Error("El usuario no existe");
          return res.status(404).json({msg : error.message});
      }

      try {
        usuario.token = generarId();
        await usuario.save();

        emailRecuperarPassword({
            nombre : usuario.nombre ,
            email : usuario.email ,
            token : usuario.token ,
        })

        res.json({msg : "Hemos enviado un email con las instrucciones"})
      } catch (error) {
        console.log(error)
      }
}

const comprobarToken = async (req , res) => {

    const {token} = req.params;

    const tokenValido = await Usuario.findOne({token});

    if(tokenValido) { 
        res.json({msg : true});
    }else{
        const error = new Error("Token no valido");
      return  res.status(404).json({msg : error.message});
    }
}

const nuevoPassword = async (req , res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token});

    if(usuario){
        usuario.password = password;
        usuario.token = '';

        try {
           await usuario.save();
           res.json({msg : "Password modificado correctamente"});
        } catch (error) {
            console.log(error);
        }
    }else{
        const error = new Error("Token no valido");
        return  res.status(404).json({msg : error.message});
    }
}

const perfil = (req , res) => {

    const {usuario} = req
    res.json(usuario);
}

export { 
    registrar ,
    autenticar ,
    confirmar ,
    olvidePassword ,
    comprobarToken , 
    nuevoPassword , 
    perfil ,
}