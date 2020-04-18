const Contato = require('../models/ContatoModel');

exports.erro = (req, res) => {
  res.render('404');
};

exports.info = (req, res) => {
  res.render('info');
};
