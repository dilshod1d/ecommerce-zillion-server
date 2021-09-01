const { Product } = require('../models/product');
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidFile = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid file type');
    if (isValidFile) {
      uploadError = null;
    }
    //cb = callback
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get('/', async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  // select method determines what to show and -minus excludes some details
  const productList = await Product.find(filter).populate('category');
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});
//get single product
router.get('/:productId', async (req, res) => {
  // populate method shows related  table details
  const product = await Product.findById(req.params.productId).populate(
    'category'
  );
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

// post a new product
router.post('/', uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }
  const file = req.file;
  if (!file) return res.status(400).send('No image in the request');
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  // protooloc returns http
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();
  if (!product) {
    return res.status(500).send('Product not created.');
  }
  res.send(product);
});

// Update product

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product Id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid Category');

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product');

  const file = req.file;
  let imagePath;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true } // we need new updated data not an old one
  );
  if (!updatedProduct) {
    return res.status(500).send('Product not updated');
  }
  res.send(updatedProduct);
});

// Delete product
router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'Product is successfully removed' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  // populate method shows related  table details
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount,
  });
});
router.get('/get/featured/:count', async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  // populate method shows related  table details
  const featuredProducts = await Product.find({ isFeatured: true }).limit(
    +count
  );
  if (!featuredProducts) {
    res.status(500).json({ success: false });
  }
  res.send(featuredProducts);
});

router.put(
  '/gallery-images/:productId',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        images: imagesPaths,
      },
      { new: true } // we need new updated data not an old one
    );
    if (!product) {
      return res.status(500).send('Product not updated');
    }
    res.send(product);
  }
);
module.exports = router;
