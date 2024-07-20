import express from 'express';
import http from 'http';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const server = http.Server(app);

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management setup
const sessionMiddleware = session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

// Use session middleware
app.use(sessionMiddleware);

// Express routing path variable
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: join(__dirname, 'public') });
});

app.get('/setId', (req, res) => {
  const queryParam = req.query.id;
  const [recordId, courseId] = queryParam.split(',');
  console.log('Received recordId:', recordId, 'and courseId:', courseId);

  req.session.recordId = recordId;
  req.session.courseId = courseId;

  res.send({
    "messages": [
      {
        "text": `${courseId} video has started. Click to view ${courseId} WI pdf for instructions.`
      }
    ]
  });
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/sendEmail', upload.fields([
  { name: 'logFile', maxCount: 1 },
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
  { name: 'photo4', maxCount: 1 },
  { name: 'photo5', maxCount: 1 },
  { name: 'photo6', maxCount: 1 }
]), (req, res) => {

  console.log('Received request to /sendEmail');
  console.log('Request body:', req.body);
  console.log('Uploaded files:', req.files);

  console.log('Environment variables:');
console.log('SMTP Host:', process.env.NAMECHEAP_SMTP_HOST);
console.log('SMTP Port:', process.env.NAMECHEAP_SMTP_PORT);
console.log('SMTP User:', process.env.NAMECHEAP_SMTP_USER);


  const { userName } = req.body;
  const logFile = req.files['logFile'][0];
  const logContent = logFile.buffer.toString('utf-8');
  const photos = [
    req.files['photo1'] ? req.files['photo1'][0] : null,
    req.files['photo2'] ? req.files['photo2'][0] : null,
    req.files['photo3'] ? req.files['photo3'][0] : null,
    req.files['photo4'] ? req.files['photo4'][0] : null,
    req.files['photo5'] ? req.files['photo5'][0] : null,
    req.files['photo6'] ? req.files['photo6'][0] : null
  ].filter(photo => photo !== null); // Filter out null values

  console.log('Processed log content:', logContent);
  console.log('Processed photos:', photos);

  const textContent = `
Hi,

${userName} has just uploaded a set of practice photos. They are included in the attachments to this message.

Log File Content:
${logContent}
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>New Photo Upload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        .log-content {
            font-family: Arial, sans-serif;
            font-size: 14px;
            white-space: pre-wrap; /* ensures line breaks are respected */
        }
    </style>
</head>
<body>
    <p>Hi,</p>
    <p>${userName} has just uploaded practice photos. Please see the attached files.</p>
    <p>Log File Content:</p>
    <div class="log-content">${logContent}</div>
</body>
</html>
`;

  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    auth: {
      user: 'simon@ishere.help',
      pass: '10815Ranchobernardo'
    }
  });

  const mailOptions = {
    from: process.env.NAMECHEAP_SMTP_USER,
    to: 'metatatt99@gmail.com',
    subject: `${userName} has just submitted practice photo(s)`,
    text: textContent,
    html: htmlContent,
    attachments: [
      { filename: logFile.originalname, content: logFile.buffer },
      ...photos.map(photo => ({ filename: photo.originalname, content: photo.buffer }))
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
      return res.status(500).send('Error uploading photos.');
    } else {
      console.log('Email sent successfully:', info.response);
      return res.status(200).send('Photos uploaded and email sent successfully.');
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
