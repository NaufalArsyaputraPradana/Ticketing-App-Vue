const nodemailer = require('nodemailer');

const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

exports.sendTicketEmail = async (userEmail, userName, eventTitle, tickets) => {
  try {
    const transporter = await createTransporter();
    
    let ticketHtml = tickets.map(t => `<p>Kode Tiket: <strong>${t.ticket_code}</strong> - Kategori: ${t.transaction_item.ticket_category.name}</p>`).join('');

    const info = await transporter.sendMail({
      from: '"TicketFlow Admin" <admin@ticketflow.local>',
      to: userEmail,
      subject: `E-Ticket Anda untuk ${eventTitle}`,
      html: `
        <h2>Halo ${userName},</h2>
        <p>Pembayaran Anda untuk event <strong>${eventTitle}</strong> telah berhasil dikonfirmasi!</p>
        <p>Berikut adalah detail E-Ticket Anda:</p>
        <div style="padding: 10px; border: 1px dashed #ccc; margin-bottom: 20px;">
          ${ticketHtml}
        </div>
        <p>Anda dapat melihat QR Code tiket ini melalui dashboard TicketFlow.</p>
        <p>Terima kasih telah menggunakan TicketFlow!</p>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
