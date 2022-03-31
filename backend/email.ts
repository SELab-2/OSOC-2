import * as nodemailer from 'nodemailer';

import * as config from './config.json';
import {Email} from './types';

// stateful function
const {mailer} = new class {
  acct: nodemailer.TestAccount|null = null;
  transp: nodemailer.Transporter<nodemailer.SentMessageInfo>|null = null;

  mailer = async (mail: Email) => {
    if (this.acct == null) {
      this.acct = await nodemailer.createTestAccount();
    }
    if (this.transp == null) {
      this.transp = nodemailer.createTransport({
        host : "smtp.ethereal.email",
        port : 587,
        secure : false, // true for 465, false for other ports
        auth : {
          user : this.acct.user, // generated ethereal user
          pass : this.acct.pass, // generated ethereal password
        }
      });
    }

    return this.transp.sendMail({
      from : config.email.from,
      to : mail.to,
      subject : mail.subject,
      html : mail.html
    });
  };
}

export default mailer;
