import nodemailer from 'nodemailer';

export const emailHandler = async (name: string, email: string, token: string) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: '"Manag-r" <accounts@manag-r.com>',
    to: email,
    subject: 'Manag-r confirm your email',
    text: 'Confirm your account on manag-r',
    html: `
        <p>Hi ${name},</p>
        <p>Please confirm your account by clicking the link below:</p>
        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm</a>
        <p>Thank you!</p>
    `,
  });
};

export const resetPasswordHandler = async (name: string, email: string, token: string) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: '"Manag-r" <accounts@manag-r.com>',
    to: email,
    subject: 'Manag-r recover your password',
    text: 'Reset your password on manag-r',
    html: `
        <p>Hi ${name},</p>
        <p>You have requested a password reset, follow the instructions in the link below:</p>
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reset password</a>
        <p>Kind regards :)</p>
    `,
  });
};
