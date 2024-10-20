const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();
const port = 3000;
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating the security key

dotenv.config();

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'locksafe1';

client.connect();
const db = client.db(dbName);
const passwordCollection = db.collection('passwords');
const userCollection = db.collection('users'); // To store emails and keys
// Load the permanent encryption key from environment variables
const permanentKey = process.env.ENCRYPTION_KEY;


app.use(bodyParser.json());
app.use(cors());

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

// Function to generate a unique 4-digit security key
async function generateUniqueSecurityKey() {
  let uniqueKey;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 4-digit number
    uniqueKey = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if the key already exists in the database
    const existingUser = await userCollection.findOne({ securityKey: uniqueKey });
    if (!existingUser) {
      isUnique = true; // Found a unique key
    }
  }
  return uniqueKey;
}


// Helper function to hash the permanent key
function getHashedKey() {
  return crypto.createHash('sha256').update(permanentKey).digest(); // Ensure the key is 32 bytes
}

function encryptPassword(password) {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const hashedKey = getHashedKey(); // Use the hashed permanent key

  // Create the cipher with aes-256-cbc using the hashed key
  const cipher = crypto.createCipheriv('aes-256-cbc', hashedKey, iv);

  let encrypted = cipher.update(password, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function decryptPassword(encryptedPassword, iv) {
  try {
    const hashedKey = getHashedKey(); // Use the hashed permanent key

    // Ensure IV is in the correct format (Buffer)
    const decipher = crypto.createDecipheriv('aes-256-cbc', hashedKey, Buffer.from(iv, 'hex'));

    // Decrypt the password
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8'); // Finalize decryption

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error('Decryption failed');
  }
}



// Function to generate JWT
function generateJWT(email) {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '20m' }); // 10-minute expiration
}

// Middleware to verify JWT
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user; // Set the verified user in the request
    next();
  });
}


// Endpoint to send the verification key via email
app.post('/send-key', async (req, res) => {
  const { email } = req.body;

  // Generate a security key
  const securityKey = await generateUniqueSecurityKey();

  // Store the email and security key in the database
  await userCollection.updateOne(
    { email },
    { $set: { email, securityKey, verified: false } },
    { upsert: true }
  );

  // Send the security key to the user's email
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your LockSafe Security Key',
    text: `Your security key is: ${securityKey}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    } else {
      console.log('Email sent:', info.response);
      res.json({ success: true, message: 'Security key sent successfully!' });
    }
  });
});

// Endpoint to verify the key
app.post('/verify-key', async (req, res) => {
  const { email, securityKey } = req.body;

  // Check if the security key matches the one in the database
  const user = await userCollection.findOne({ email, securityKey });

  if (user) {
    // Mark the user as verified
    await userCollection.updateOne(
      { email },
      { $set: { verified: true } }
    );
    const token = generateJWT(email);
    res.json({ success: true, message: 'Email verified successfully!', token });
  } else {
    res.status(400).json({ success: false, message: 'Invalid security key' });
  }
});

// Get all passwords (requires JWT authentication)
app.get('/passwords', authenticateJWT, async (req, res) => {
  const { email } = req.user; // Get the email from the JWT

  const passwords = await passwordCollection.find({ email }).toArray();
  res.json(passwords);
});

// Save a password (requires JWT authentication)
app.post('/passwords', authenticateJWT, async (req, res) => {
  const { email } = req.user;
  const { passwordData } = req.body;

  const user = await userCollection.findOne({ email });
  const { iv, encryptedData } = encryptPassword(passwordData.password);

  const result = await passwordCollection.insertOne({ ...passwordData,password: encryptedData, iv, email });
  res.json({ success: true, result });
});


app.get('/passwords/:id', authenticateJWT, async (req, res) => {
  const { email } = req.user;
  const passwordId = req.params.id;

  // Find the password entry in the database
  const passwordEntry = await passwordCollection.findOne({ _id: new ObjectId(passwordId), email });

  if (!passwordEntry) {
    return res.status(404).json({ success: false, message: 'Password not found' });
  }

  try {
    // Decrypt the password using the permanent key and stored IV
    const decryptedPassword = decryptPassword(passwordEntry.password, passwordEntry.iv);
    res.json({ success: true, decryptedPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Decryption failed' });
  }
});


app.delete('/passwords', authenticateJWT, async (req, res) => {
  const { email } = req.user;
  const { passwordId } = req.body;

  // Validate and delete based on the ObjectId
  if (!ObjectId.isValid(passwordId)) {
    return res.status(400).json({ success: false, message: 'Invalid password ID format' });
  }

  const result = await passwordCollection.deleteOne({ _id: new ObjectId(passwordId), email });
  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'Password not found or unauthorized' });
  }

  res.json({ success: true, message: 'Password deleted successfully' });
});


app.listen(port, () => {
  console.log(`LockSafe app listening on port ${port}`);
});
