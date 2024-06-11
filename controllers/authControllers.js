const express = require("express");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/verifyToken");
const upload = require("../middleware/multer");

// Inscription
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "L'utilisateur existe déjà" });
    }

    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 86400 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

// Connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Identifiants invalides" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 86400 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

// Obtenir l'utilisateur
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

// Upload de l'image de profil
// Logique pour mettre à jour l'image de profil d'un utilisateur
router.post(
  "/updateProfileImage",
  auth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      if (!req.file) {
        return res.status(400).send("Aucun fichier téléchargé");
      }

      user.profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      await user.save();

      res.send({ profileImageUrl: user.profileImageUrl });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur du serveur");
    }
  }
);

// Par exemple, dans votre route qui gère l'affichage du profil d'un utilisateur
router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer l'URL de l'image de profil de l'utilisateur spécifié
    const userProfileImage = await User.findById(userId).select(
      "profileImageUrl"
    );
    const profileImageUrl = userProfileImage.profileImageUrl;

    // Ensuite, vous pouvez envoyer cette URL dans la réponse pour l'affichage dans votre interface utilisateur
    res.json({ profileImageUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur du serveur");
  }
});

module.exports = router;
