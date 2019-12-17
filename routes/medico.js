var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app =  express();

var Medico = require('../models/medico');

/* ===================================================
   Obtener todos los medicoes METODO GET
   =================================================== */
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({ })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            ( err, medicos ) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR de base de datos medicos',
                errors: err
            });
        }

        Medico.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });

        });


    });

});

/* ===================================================
   Actiualizar Hopitales METODO PUT
   =================================================== */
   app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medico) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al buscar Medicos',
                errors: err
            });
        }

        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        
        medico.save( (err, medicoGuardado) => {

            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

/* ===================================================
    Crear un nuevo medico METODO POST
   =================================================== */
   app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( ( err, medicoGuardado ) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

/* ===================================================
   Eliminar un medico por el id MOTEDO DELETE
   =================================================== */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove( id, (err, medicoBorrado) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al eliminar medico',
                errors: err
            });
        }

        if( !medicoBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: {message: 'No existe un medico con ese id.'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;