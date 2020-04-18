const mongoose = require('mongoose');
const validator = require('validator');


const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  apelido: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  rua: { type: String, required: false, default: '' },
  cp: { type: String, required: false, default: '' },
  localidade: { type: String, required: false, default: '' },
  criadoEm: { type: Date, default: Date.now }
});

const ContatoModel = (id) => {
  return mongoose.model(id, ContatoSchema);
};


function Contato(body, session) {
  this.body = body;
  this.errors = [];
  this.contato = null;
  this.session = session;

}


Contato.prototype.register = async function () {

  this.valida();
  if (this.errors.length > 0) return;
  const agenda = this.session.user.agenda || this.session.user._id;


  this.contato = await ContatoModel(agenda).create(this.body);
};

Contato.prototype.valida = function () {
  this.cleanUp();
  //Validação
  // O e-mail precisa de ser válido
  if (this.body.email && !validator.isEmail(this.body.email)) this.errors.push('E-mail inválido.');
  if (!this.body.nome) this.errors.push('Nome é um campo obrigatório');
  if (!this.body.email && !this.body.telefone) {
    this.errors.push('Pelo menos um contato precisa de ser enviado: e-mail ou telefone.');
  }
};

Contato.prototype.cleanUp = function () {
  for (const key in this.body) {
    if (typeof this.body[key] !== 'string') {
      this.body[key] = '';
    }
  }

  this.body = {
    nome: this.body.nome,
    apelido: this.body.apelido,
    telefone: this.body.telefone,
    email: this.body.email,
    rua: this.body.rua,
    cp: this.body.cp,
    localidade: this.body.localidade
  }

};

Contato.prototype.edit = async function (id) {
  if (typeof id !== 'string') return;
  this.valida();
  if (this.errors.length > 0) return;
  const agenda = this.session.user.agenda || this.session.user._id;
  this.contato = await ContatoModel(agenda).findByIdAndUpdate(id, this.body, { new: true });
};

//Métodos estáticos
Contato.buscaPorId = async function (sessionid, id) {
  if (typeof id !== 'string') return;
  const contato = await ContatoModel(sessionid).findById(id);
  return contato;
}

Contato.buscaContatos = async function (sessionid) {
  const contatos = await ContatoModel(sessionid).find()
    .sort({ nome: 1 })     //1 crescente, -1 decrescente

  return contatos;

}

Contato.delete = async function (sessionid, id) {
  if (typeof id !== 'string') return;
  const contato = await ContatoModel(sessionid).findOneAndDelete({ _id: id });
  return contato;
}

Contato.deleteAgenda = async function (sessionid) {
  try {
    const agenda = await ContatoModel(sessionid).collection.drop();
    return agenda;
  } catch (e) {
    return;
  }
}

module.exports = Contato;
