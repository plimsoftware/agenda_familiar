// using SendGrid's Node.js Library - https://github.com/sendgrid/sendgrid-nodejs
exports.sendMailPass = function (key, to, from, subj, body) {

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(key);				//SENDGRID_API_KEY  colocar no .env
    const msg = {
      to: to,
      from: from,
      subject: subj,
      html: body
    };
    //ES6
    sgMail
      .send(msg)
      .then(() => {}, error => {
        console.error(error);
    
        if (error.response) {
          console.error(error.response.body)
        }
      });
}
