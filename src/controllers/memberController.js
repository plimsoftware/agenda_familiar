const Login = require('../models/LoginModel');

exports.index = async (req, res) => {
    if (req.session.user) {
        const membros = await Login.buscaMembros(req.session.user._id);
        return res.render('members', { membros });
    }
    return res.render('login');
};

exports.register = async function (req, res) {
    try {
        const login = new Login(req.body, req.session.user._id, req.session.user.email);
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
            return res.redirect('/index');
        });

    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.delete = async function (req, res) {
    if (!req.params.id) return res.render('404');
    const membro = await Login.delete(req.params.id);
    if (!membro) return res.render('404');

    req.flash('success', 'Membro apagado com sucesso.');
    req.session.save(() => res.redirect('back'));
    return;
};

exports.account = async function (req, res) {
    if (req.session.user) return res.render('member-account');
    return res.render('login');
};

exports.accountadmin = async function (req, res) {
    if (req.session.user) return res.render('admin-account');
    return res.render('login');
};

exports.update = async function (req, res) {

    try {
        if (!req.session.user) return res.render('404');
        const login = await Login.buscaPorId(req.session.user._id);
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
    req.session.save(() => res.redirect('back'));
    return;

};

exports.deleteaccount = async function (req, res) {
    const contato = await Login.delete(req.session.user._id);
    if (!contato) return res.render('404');

    req.flash('success', 'User apagado com sucesso.');
    await req.session.destroy();
    res.redirect('/');
    return;
};
