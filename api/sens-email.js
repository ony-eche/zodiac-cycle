const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
if (event.httpMethod !== 'POST') {
return { statusCode: 405, body: 'Method Not Allowed' };
}

try {
const { to, subject, html } = JSON.parse(event.body);

const { data, error } = await resend.emails.send({
from: 'you@yourdomain.com', // must be verified in Resend dashboard
to,
subject,
html,
});

if (error) {
return { statusCode: 500, body: JSON.stringify({ error }) };
}

return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
} catch (err) {
return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
}
}; 