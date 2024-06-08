// routes/text.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const Text = require('../models/textSchema');
const authenticateToken = require('../middleware/verifyToken');
const router = express.Router();

// Créer un texte
router.post(
  '/',
  [authenticateToken, [check('content', 'Le contenu est requis').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newText = new Text({
        user: req.user.id,
        content: req.body.content
      });

      const text = await newText.save();
      res.json(text);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur du serveur');
    }
  }
);

// Obtenir tous les textes de l'utilisateur connecté
router.get('/', authenticateToken, async (req, res) => {
  try {
    const texts = await Text.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(texts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

// Mettre à jour un texte
router.put(
  '/:id',
  [authenticateToken, [check('content', 'Le contenu est requis').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let text = await Text.findById(req.params.id);
      if (!text) {
        return res.status(404).json({ msg: 'Texte non trouvé' });
      }

      // Vérifier si l'utilisateur connecté est le propriétaire du texte
      if (text.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Non autorisé' });
      }

      text = await Text.findByIdAndUpdate(
        req.params.id,
        { $set: { content: req.body.content } },
        { new: true }
      );

      res.json(text);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur du serveur');
    }
  }
);

// Supprimer un texte
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let text = await Text.findById(req.params.id);
    if (!text) {
      return res.status(404).json({ msg: 'Texte non trouvé' });
    }

    // Vérifier si l'utilisateur connecté est le propriétaire du texte
    if (text.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    await Text.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Texte supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

module.exports = router;
