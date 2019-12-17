var express = require('express');

// Inicializar variables

var app =  express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/* ===================================================
   BUSQUEDA POR COLECCIÓN
   =================================================== */
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp( busqueda, 'i' );

    var promesa;

    switch( tabla ){

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
        break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
        break;

        case 'hospitales':
            promesa = buscarHopitales(busqueda, regex);
        break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Los tipos de busqueda sólo son: MEDICOS, USUARIOS, HOSPITALES',
                errors: {message: 'Tipo de tabla/coleccion no válidos'}
            });
    }

    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});


/* ===================================================
   BUSQUEDA GENERAL
   Metodo que nos permite mostar los USUARIOS, MEDICOS, HOSPITALES
   por medio de una primesa ALL 
   =================================================== */
app.get('/todo/:busqueda', ( req, res, next ) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i' );

    Promise.all([
            buscarHopitales(busqueda, regex), 
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex) ])
        .then( respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    }).catch( err => {
        res.status(400).json({
            ok: false,
            message: 'ERROR al buscar los datos generales',
            errors: err
        });
    });

});

/* ===================================================
   Funcion que nos permite buscar por HOSPITALES
   retonando una promesa
   =================================================== */
function buscarHopitales(busqueda, regex) {
    
    return new Promise( (resolve, reject) => {

        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec( (err, hospitales) => {
    
                if(err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
    
        });
    });

}

/* ===================================================
   Funcion que nos permite buscar por MEDICOS
   retornando una promesa
   =================================================== */
function buscarMedicos(busqueda, regex) {
    
    return new Promise( (resolve, reject) => {

        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
    
                if(err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
    
        });
    });

}

/* ===================================================
   Funcion que nos permite buscar por USUARIO
   retornando una promesa
   =================================================== */
function buscarUsuarios(busqueda, regex) {
    
    return new Promise( (resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([ {'nombre': regex}, {'email': regex} ])
            .exec( (err, usuarios ) => {

                if(err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });
    });

}

module.exports = app;