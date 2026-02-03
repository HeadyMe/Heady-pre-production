const nodemailer = require('nodemailer');

class HeadyNotifier {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.NOTIFIER_EMAIL,
        pass: process.env.NOTIFIER_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, text) {
    const mailOptions = {
      from: process.env.NOTIFIER_EMAIL,
      to,
      subject,
      text
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent');
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}

module.exports = HeadyNotifier;
