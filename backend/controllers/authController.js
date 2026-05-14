const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, dreamJob: user.dreamJob } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const FIREBASE_PROJECT_ID = 'interviewiq-626b7';

async function verifyFirebaseToken(idToken) {
  const publicKeysRes = await axios.get(
    `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com/${FIREBASE_PROJECT_ID}`
  );
  const publicKeys = publicKeysRes.data;
  const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
  const publicKey = publicKeys[header.kid];
  if (!publicKey) throw new Error('No matching public key');
  const decoded = jwt.verify(idToken, publicKey, { algorithms: ['RS256'] });
  if (decoded.aud !== FIREBASE_PROJECT_ID) throw new Error('Wrong audience');
  if (decoded.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error('Wrong issuer');
  return decoded;
}

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await verifyFirebaseToken(idToken);
    const { email, name, sub } = decoded;
    
    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: bcrypt.hashSync(sub + 'google', 10)
      });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, dreamJob: user.dreamJob } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, dreamJob, currentSkills, bio, phone, location, linkedin, github } = req.body;
    const updateData = { dreamJob, currentSkills };
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (currentSkills && typeof currentSkills === 'string') {
      updateData.currentSkills = currentSkills.split(',').map(s => s.trim()).filter(s => s);
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};