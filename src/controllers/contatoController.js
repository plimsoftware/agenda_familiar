const Contato = require('../models/ContatoModel');

exports.index = (req, res) => {
    res.render('contato', {
        contato: {}
    });
};

exports.register = async (req, res) => {
    try {
        const contato = new Contato(req.body, req.session);
        await contato.register();

        if (contato.errors.length > 0) {
            req.flash('errors', contato.errors);
            req.session.save(() => res.redirect('back'));
            return;
        }

        req.flash('success', 'Contato registrado com sucesso.');
        req.session.save(() => res.redirect(`/contato/index/${contato.contato._id}`));
        return;
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.editIndex = async function (req, res) {
    if (!req.params.id) return res.render('404');
    const agenda = req.session.user.agenda || req.session.user._id;
    const contato = await Contato.buscaPorId(agenda, req.params.id);
    if (!contato) return res.render('404');

    res.render('contato', { contato });
};

exports.edit = async function (req, res) {
    try {
        if (!req.params.id) return res.render('404');
        const contato = await new Contato(req.body, req.session);
        await contato.edit(req.params.id);

        if (contato.errors.length > 0) {
            req.flash('errors', contato.errors);
            req.session.save(() => res.redirect('back'));
            return;
        }

        req.flash('success', 'Contato atualizado com sucesso.');
        req.session.save(() => res.redirect(`/contato/index/${contato.contato._id}`));
        return;
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.delete = async function (req, res) {
    if (!req.params.id) return res.render('404');
    const agenda = req.session.user.agenda || req.session.user._id;
    const contato = await Contato.delete(agenda, req.params.id);
    if (!contato) return res.render('404');

    req.flash('success', 'Contato apagado com sucesso.');
    req.session.save(() => res.redirect('back'));
    return;
};

exports.lista = async (req, res) => {
    const expandir = ' ';
    const agenda = req.session.user.agenda || req.session.user._id;
    const contatos = await Contato.buscaContatos(agenda);
    res.render('index', { contatos, expandir });
};

exports.expand = async function (req, res) {

    const agenda = req.session.user.agenda || req.session.user._id;
    const contatos = await Contato.buscaContatos(agenda);

    if (!req.params.id) return res.render('404');
    const expandir = req.params.id;

    res.render('index', {
        contatos, expandir
    });


    return;

};
