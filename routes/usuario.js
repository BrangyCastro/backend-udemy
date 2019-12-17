var express = require('express');
var bcrypt = require('bcryptjs');  
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app =  express();

var Usuario = require('../models/usuario');

/* ===================================================
   Obtener todos los usuarios METODO GET
   =================================================== */
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            ( err, usuarios ) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR de base de datos',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {
            
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });

        });


    });

});

// TODO: Esta es una forma de verificar el token con NEXT
/* ===================================================
   Verificar token
   =================================================== */
// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify( token, SEED, (err, decoded) => {

//         if( err ) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'El token no valido',
//                 errors: err
//             });
//         }

//         next();

//     });

// });

/* ===================================================
   Actiualizar usuario METODO PUT
   =================================================== */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al buscar usuario',
                errors: err
            });
        }

        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        
        usuario.save( (err, usuarioGuardado) => {

            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

/* ===================================================
    Crear un nuevo usuario METODO POST
   =================================================== */
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioGuardado ) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

/* ===================================================
   Eliminar un usuario por el id MOTEDO DELETE
   =================================================== */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, (err, usuarioBorrado) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al eliminar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: {message: 'No existe un usuario con ese id.'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;