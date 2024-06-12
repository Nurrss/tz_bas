const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const shortid = require("shortid");
const URL = require("../models/Url");

router.post("/shorten", async (req, res) => {
  const { url } = req.body;
  const baseUrl = process.env.BASE_URL;

  if (!validUrl.isUri(baseUrl)) {
    return res.status(400).json("Invalid base URL");
  }

  if (!validUrl.isUri(url)) {
    return res.status(400).json("Invalid original URL");
  }

  try {
    let urlObj = await URL.findOne({ originalUrl: url });
    if (urlObj) {
      return res.json({
        shortcode: urlObj.shortcode,
        redirect: `${baseUrl}/${urlObj.shortcode}`,
      });
    } else {
      const shortcode = shortid.generate();
      urlObj = new URL({
        originalUrl: url,
        shortcode: shortcode,
      });
      await urlObj.save();

      return res.json({
        shortcode: shortcode,
        redirect: `${baseUrl}/${shortcode}`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

router.get("/:shortcode", async (req, res) => {
  try {
    const urlObj = await URL.findOne({ shortcode: req.params.shortcode });
    if (urlObj) {
      return res.redirect(302, urlObj.originalUrl);
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

module.exports = router;
