const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const contatoController = require('./src/controllers/contatoController');
const memberController = require('./src/controllers/memberController');
const { loginRequired } = require('./src/middlewares/middleware');

// Rotas da home
//route.get('/index', loginRequired, homeController.index);
route.get('/index', loginRequired, contatoController.lista);    //Lista de contatos
route.get('/info', homeController.info);

//Rotas de Login
route.get('/', loginController.index);                          //Página inicial Login
route.get('/login/index', loginController.registerIndex);       //Página de registo user
route.post('/login/register', loginController.register);        //Criação User
route.post('/login/login', loginController.login);              //Login User
route.get('/login/logout', loginController.logout);             //Logout User
route.get('/login/rpassword', loginController.getPassword);     //Recuperar password
route.post('/login/rpassword', loginController.sendPassword);
route.get('/login/resetpassword/:email/:id', loginController.receivePassword);  //Endereço de destino dos mails
route.post('/login/resetpassword1', loginController.resetpasswordRec);

//Rotas de Membros
route.get('/login/members', loginRequired, memberController.index);            //Página de gestão de membros
route.post('/login/membersRegister', loginRequired, memberController.register);
route.get('/login/memberDelete/:id', loginRequired, memberController.delete);
route.get('/login/account', loginRequired, memberController.account);
route.post('/login/account/update', loginRequired, memberController.update);
route.get('/login/accountadmin', loginRequired, memberController.accountadmin);
route.post('/login/account/delete', loginRequired, memberController.deleteaccount);
route.post('/login/accountadmin/delete', loginRequired, loginController.deleteaccountadmin);


// Rotas de contato
route.get('/contato/index', loginRequired, contatoController.index);
route.post('/contato/register', loginRequired, contatoController.register);
route.get('/contato/index/:id', loginRequired, contatoController.editIndex);
route.post('/contato/edit/:id', loginRequired, contatoController.edit);
route.get('/contato/delete/:id', loginRequired, contatoController.delete);
route.get('/contato/expand/:id', loginRequired, contatoController.expand);

// Rotas da erro
route.get('*', homeController.erro);

module.exports = route;
