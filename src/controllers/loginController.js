require('dotenv').config();
const Login = require('../models/LoginModel');
const randcode = require('../modules/generateRandomCode');
const sendMail = require('../modules/sendMail');

exports.index = (req, res) => {
    if (req.session.user) return res.render('login-logado');
    return res.render('login');
};

exports.registerIndex = (req, res) => {
    if (!req.session.user) return res.render('login-register');
    return res.render('login');
};

exports.register = async function (req, res) {
    try {
        const login = new Login(req.body);
        await login.register();

        if (login.errors.length > 0) {
            req.flash('errors', login.errors);
            req.session.save(function () {
                return res.redirect('back');
            });
            return;
        }

        req.flash('success', 'Seu user foi criado com sucesso.');
        req.session.save(function () {
            return res.redirect('/');
        });

    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.login = async function (req, res) {
    try {
        const login = new Login(req.body);
        await login.login();

        if (login.errors.length > 0) {
            req.flash('errors', login.errors);
            req.session.save(function () {
                return res.redirect('back');
            });
            return;
        }

        req.flash('success', 'Você entrou no sistema.');
        req.session.user = login.user;
        req.session.save(function () {
            return res.redirect('back');
        });

    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.logout = async function (req, res) {
    await req.session.destroy();
    res.redirect('/');
}

exports.deleteaccountadmin = async function (req, res) {
    const contato = await Login.deleteAdmin(req.session.user);
    if (!contato) return res.render('404');

    req.flash('success', 'User apagado com sucesso.');
    await req.session.destroy();
    res.redirect('/');
    return;
};

exports.getPassword = (req, res) => {
    return res.render('login-recover');
    
};

exports.sendPassword = async function (req, res) {

    const exist = await Login.userExists(req.body.email);
    if (!exist) {
        req.flash('errors', 'O E-mail não existe.');
        return res.redirect('/');
    }

    try {
        if (!exist) return res.render('404');
        const usuario = new Login(exist, exist.agenda, exist.agendaemail, exist.recovercode, exist.datesend);
        const codigo = randcode.randCode(25, true, true, true, false);
        const newDate = new Date();
        await usuario.updateRecoverPass(codigo, newDate.getDate());
        const bodyMail = `Por favor, use o seguinte link para efectuar o <a href="https://agenda.plimsoftware.pt/login/resetpassword/${exist.email}/${codigo}">Reset da password</a>.<br>` +
            '<p><strong>Nota:</strong> Este link só tem validade para o dia de envio.</p>' +
            '<p>Se não solicitou esta reposição de password, por ignore este mail.</p>' +
            `<p>Se tiver alguma questão ou sugestão, não hesite em entrar contato connosco através do e-mail <a href="mailto:plimsoftware@gmail.com">plimsoftware@gmail.com</a>.</p>`;
        sendMail.sendMailPass(process.env.KEYSENDGRID, exist.email, 'plimsoftware@gmail.com', 'Recuperação password Agenda Familiar', bodyMail);

        if (usuario.errors.length > 0) {
            req.flash('errors', usuario.errors);
            req.session.save(function () {
                return res.redirect('back');
            });
            return;
        }

    } catch (e) {
        console.log(e);
        return res.render('404');
    }

    req.flash('success', 'Pedido efetuado com sucesso');
    return res.redirect('/');

};

exports.receivePassword = async function (req, res) {
    if (!req.params.id && !req.params.email) return res.render('404');

    const exist = await Login.userExists(req.params.email);


    if (!exist) {
        req.flash('errors', 'O E-mail não existe.');
        return res.redirect('/');
    }

    const newDate = new Date();
    if (exist.datesend != newDate.getDate()) {
        req.flash('errors', 'O link expirou. Solicite nova recuperação.');
        return res.redirect('/');
    }

    if (exist.recovercode !== req.params.id) {
        req.flash('errors', 'Ocorreu um erro. Verifique se usou o último mail enviado.');
        return res.redirect('/');
    }

    const userId = exist._id;
    return res.render('reset-password', { userId });

};

exports.resetpasswordRec = async function (req, res) {

    try {
        const login = await Login.buscaPorId(req.body.id);
        const usuario = new Login(login, login.agenda, login.agendaemail, login.recovercode, login.datesend);
        await usuario.updatePass(req.body);

        if (usuario.errors.length > 0) {
            req.flash('errors', usuario.errors);
            req.session.save(function () {
                return res.redirect('back');
            });
            return;
        }

    } catch (e) {
        console.log(e);
        return res.render('404');
    }

    req.flash('success', 'User atualizado com sucesso.');
    req.session.save(() => res.redirect('/'));
    return;

};
