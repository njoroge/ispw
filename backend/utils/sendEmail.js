// Mock email sending utility
// In a real application, this would use nodemailer to send actual emails.

const sendEmail = async (to, subject, text) => {
  console.log('--- Mock Email Start ---');
  console.log(`To: ${to}`);
  console.log(`From: ${process.env.EMAIL_FROM || 'noreply@example.com'}`); // Use EMAIL_FROM from env
  console.log(`Subject: ${subject}`);
  console.log('Body:');
  console.log(text);
  console.log('--- Mock Email End ---');

  // Simulate email sending success
  // In a real scenario, you would handle potential errors from nodemailer here.
  return Promise.resolve({ message: 'Email sent successfully (mock)' });
};

module.exports = sendEmail;
