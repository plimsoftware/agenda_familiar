const Contato = require('./ContatoModel');
const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: String, required: true },
  agenda: { type: String, required: false },
  agendaemail: { type: String, required: false },
  recovercode: { type: String, required: false },
  datesend: { type: Number, required: false }
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body, agenda = '', agendaemail = '', recovercode = '', datesend = 0) {
    this.body = body;
    this.errors = [];
    this.user = null;
    this.agenda = agenda;
    this.agendaemail = agendaemail;
    this.recovercode = recovercode;
    this.datesend = datesend
  }

  async login() {
    this.valida(false);
    if (this.errors.length > 0) return;
    this.user = await LoginModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push('User não existe.');
      return;
    }

    if (!bcryptjs.compareSync(this.body.password, this.user.password)) {
      this.errors.push('Senha inválida.');
      this.user = null;
      return;
    }

  }

  async register() {
    this.valida(true);
    if (this.errors.length > 0) return;
    const exist = await Login.userExists(this.body.email);
    if (exist) this.errors.push('User já existe.');

    if (this.errors.length > 0) return;

    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(this.body.password, salt);

    this.user = await LoginModel.create(this.body);
  }

  async updatePass(body) {

    // A senha precisa ter entre 5 a 50 caractares
    if (body.password.length < 5 || body.password.length > 50) {
      this.errors.push('A senha precisa ter entre 5 e 50 caracteres.');
    }
    if (body.password !== body.repassword) {
      this.errors.push('As senhas não estão iguais.');
      return;
    }
    if (this.errors.length > 0) return;

    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(body.password, salt);
    this.body.recovercode = '';
    this.body.datesend = 0;

    this.user = await LoginModel.findByIdAndUpdate(this.body._id, this.body, { new: true });

  }

  async updateRecoverPass(recCod, newDate) {

    this.body.recovercode = recCod;
    this.body.datesend = newDate;
    this.user = await LoginModel.findByIdAndUpdate(this.body._id, this.body, { new: true });

  }

  valida(repass) {
    this.cleanUp();
    //Validação
    // O e-mail precisa de ser válido
    if (!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido.');

    // A senha precisa ter entre 5 a 50 caractares
    if (this.body.password.length < 5 || this.body.password.length > 50) {
      this.errors.push('A senha precisa ter entre 5 e 50 caracteres.');
    }

    if (repass) {// Se as senhas são iguais
      if (this.body.password !== this.body.repassword) {
        this.errors.push('As senhas não estão iguais.');
      }
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    this.body = {
      email: this.body.email,
      password: this.body.password,
      repassword: this.body.repassword,
      admin: this.body.admin,
      agenda: this.agenda,
      agendaemail: this.agendaemail,
      recovercode: this.recovercode,
      datesend: this.datesend
    }
  }
}

Login.buscaMembros = async function (albumid) {
  const membros = await LoginModel.find({ agenda: albumid })
  return membros;
}

Login.buscaPorId = async function (id) {
  if (typeof id !== 'string') return;
  const contato = await LoginModel.findById(id);
  return contato;
}

Login.delete = async function (id) {
  if (typeof id !== 'string') return;
  const membro = await LoginModel.findOneAndDelete({ _id: id });
  return membro;
}

Login.deleteAdmin = async function (dados) {

  //Apaga membros
  const membros = await Login.buscaMembros(dados._id);
  membros.forEach(async membro => {
    await LoginModel.findOneAndDelete({ _id: membro._id });
  });

  //Apaga agenda
  await Contato.deleteAgenda(dados._id);

  //Apaga user
  const usuario = await LoginModel.findOneAndDelete({ _id: dados._id });
  return usuario;
}

Login.userExists = async function (email) {
  const user = await LoginModel.findOne({ email: email });
  return user;
}


module.exports = Login;
