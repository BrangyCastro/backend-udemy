var express = require('express');

// Inicializar variables

var app =  express();


app.get('/', ( req, res, next ) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada corectamente....'
    });

});

module.exports = app;