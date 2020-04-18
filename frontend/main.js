import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './modules/cookieConsent';

const form = document.querySelector('.form_accountDelete');
const btDelete = document.querySelector('#apagarBt');


// Check form buttons
if (btDelete) {
    btDelete.addEventListener('click', function (e) {
        e.preventDefault();
        const cont = confirm('Tem a certeza que quer continuar?');
        if (cont) {
            form.submit();
        } else return;
    });
}
