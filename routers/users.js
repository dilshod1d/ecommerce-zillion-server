const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  const userList = await User.find().select('-passwordHash');
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});
// Get single user
router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId).select('-passwordHash');
  if (!user) {
    return res.status(500).json({ message: 'User not found' });
  }
  res.status(200).send(user);
});

router.post('/', async function (req, res) {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) {
    return res.status(404).send('User Not Created');
  }
  res.send(user);
});
router.post('/register', async function (req, res) {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) {
    return res.status(404).send('User Not Created');
  }
  res.send(user);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send('Email or password is incorrect');
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: '1d' } //options > expries in one day
    );
    res.status(200).send({ email: user.email, token: token });
  } else {
    return res.status(400).send('Email or password is incorrect');
  }
});
// Delete user
router.delete('/:userId', (req, res) => {
  Product.findByIdAndRemove(req.params.userId)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: 'User is successfully removed' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  // populate method shows related  table details
  const userCount = await User.countDocuments((count) => count);
  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount,
  });
});

module.exports = router;
