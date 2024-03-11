import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {

    const {nombre , email , token} = datos;

    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
      });

    
    const info = await transport.sendMail({
        from : ' "UpTask - Administrador de Proyectos" <cuentas@uptask.com>' ,
        to : email ,
        subject : "Uptask - Comprueba tu cuenta" ,
        text : "Comprueba tu cuenta en UpTask" ,
        html : `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya esta casi lista, solo debes comproborla en el siguiente enlace :

        <a href="${process.env.FRONTED_URL}/confirmar/${token}">Comprobar Cuenta </a> </p>

        <p>Si tu no creaste esta cuenta , puedes ignorar este email</p>

        `
    });
}

export const emailRecuperarPassword = async (datos) => {

  const {nombre , email , token} = datos;

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

  
  const info = await transport.sendMail({
      from : ' "UpTask - Administrador de Proyectos" <cuentas@uptask.com>' ,
      to : email ,
      subject : "Uptask - Actualizar tu password" ,
      text : "Actualiza tu password en UpTask" ,
      html : `<p>Hola: ${nombre} ingresa en el siguiente enlace para actualizar tu password</p>
      

      <a href="${process.env.FRONTED_URL}/olvide-password/${token}">Actualiza tu password </a> </p>

      <p>Si tu no creaste esta cuenta , puedes ignorar este email</p>

      `
  });


}

export const emailEliminarColaborador =async (usuario , proyecto) => {
  const {nombre , email } = usuario;

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transport.sendMail({
      from : ' "UpTask - Administrador de Proyectos" <cuentas@uptask.com>' ,
      to : email ,
      subject : `Uptask ` ,
      text : `Fuiste eliminado del proyecto ${proyecto.nombre}` ,
      html : `<p>Hola: ${nombre} , fuiste eliminado del proyecto "${proyecto.nombre}" por el creador del proyecto</p>

      `
  });

}


export const emailAgregadoComoColaborador =async (usuario , proyecto) => {
  const {nombre , email } = usuario;

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transport.sendMail({
      from : ' "UpTask - Administrador de Proyectos" <cuentas@uptask.com>' ,
      to : email ,
      subject : `Uptask ` ,
      text : `Fuiste agregado al proyecto ${proyecto.nombre}` ,
      html : `<p>Hola: ${nombre} , fuiste agregado al proyecto "${proyecto.nombre}" por el creador del proyecto</p>

      `
  });

}