var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app =  express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', ( req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    /* ===================================================
       Tipos de colecciones
       =================================================== */
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if( tiposValidos.indexOf( tipo ) < 0 ){

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colecccion no es valido',
            errors: {message: 'Tipo de colecccion no es valido'}
        });

    }

    /* ===================================================
       Verificar si envian una imagen
       =================================================== */
    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {message: 'debe seleccionar una imagen'}
        });

    }

    /* ===================================================
       obtner nombre del archivo
       =================================================== */
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    /* ===================================================
       Solo estas extenciones aceptamos
       =================================================== */
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensiones no validas',
            errors: {message: 'Las extensiones validad son: ' + extensionesValidas.join(', ')}
        });
    }

    /* ===================================================
       Nombre de archivo personalizado
       =================================================== */
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ extensionArchivo }`;

    /* ===================================================
       Mover el archivo del temporal al path
       =================================================== */
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al mover el archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

    });

});


function subirPorTipo( tipo, id, nombreArchivo, res ){

    if( tipo === 'usuarios'){

        Usuario.findById( id, (err, usuario) => {

            if( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            /* ===================================================
               Si existe el path elimina la IMAGEN anterior
               =================================================== */
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'ERROR al buscar usuario',
                        errors: err
                    });
                }
                
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    }

    if( tipo === 'hospitales'){

        Hospital.findById( id, (err, hospital) => {

            if( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            /* ===================================================
               Si existe el path elimina la IMAGEN anterior
               =================================================== */
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'ERROR al buscar hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });

            });

        });
    }

    if( tipo === 'medicos'){

        Medico.findById( id, (err, medico) => {

            if( !medico ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            /* ===================================================
               Si existe el path elimina la IMAGEN anterior
               =================================================== */
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado) => {

                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'ERROR al buscar medico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    usuario: medicoActualizado
                });

            });

        });
    }
}

module.exports = app;