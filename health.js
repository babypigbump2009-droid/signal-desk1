// Tells the page which backends are configured. Never returns the keys themselves.
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    data: Boolean(process.env.TWELVEDATA_KEY),
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
  });
};
