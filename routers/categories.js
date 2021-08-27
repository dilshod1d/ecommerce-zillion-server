const { Category } = require('../models/category');
const express = require('express');
const { json } = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});
// Get single category
router.get('/:categoryId', async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    return res.status(500).json({ message: 'Category not found' });
  }
  res.status(200).send(category);
});

router.post('/', async function (req, res) {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) {
    return res.status(404).send('Category not created');
  }
  res.send(category);
});

router.put('/:categoryId', async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true } // we need new updated data not an old one
  );
  if (!category) {
    return res.status(404).send('Category not created');
  }
  res.send(category);
});

router.delete('/:categoryId', (req, res) => {
  Category.findByIdAndRemove(req.params.categoryId)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: 'Category is successfully removed' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
