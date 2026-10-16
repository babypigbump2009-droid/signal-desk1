// GET /api/candles?cls=stocks&symbol=AAPL&interval=1h  ->  { candles: [{t,o,h,l,c}, ...] } (oldest first)
const INTERVALS = { "5min": 60, "15min": 120, "1h": 300, "4h": 600, "1day": 900, "1week": 1800 };
const CLASSES = new Set(["stocks", "etfs", "forex", "crypto", "indices"]);

function toSymbol(cls, s) {
  if (cls === "forex" && !s.includes("/") && s.length === 6) return s.slice(0, 3) + "/" + s.slice(3);
  if (cls === "crypto" && !s.includes("/")) return s + "/USD";
  return s;
}

module.exports = async (req, res) => {
  const key = process.env.TWELVEDATA_KEY;
  const fail = (code, error) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(code).json({ error });
  };
  if (!key) return fail(503, "TWELVEDATA_KEY is not set on the server.");

  const { cls = "", symbol = "", interval = "" } = req.query || {};
  if (!CLASSES.has(cls) || !/^[A-Za-z0-9.\-:/]{1,20}$/.test(symbol) || !(interval in INTERVALS)) {
    return fail(400, "Bad request.");
  }

  try {
    const url =
      "https://api.twelvedata.com/time_series?symbol=" + encodeURIComponent(toSymbol(cls, symbol)) +
      "&interval=" + interval + "&outputsize=320&order=ASC&timezone=UTC&apikey=" + encodeURIComponent(key);
    const r = await fetch(url);
    const j = await r.json();

    if (j.status === "error" || !Array.isArray(j.values)) {
      const code = Number(j.code);
      if (code === 429) return fail(429, "Data provider rate limit reached. Wait a minute and try again.");
      if (code === 401) return fail(502, "The data provider rejected the API key.");
      if (code === 400 || code === 403 || code === 404)
        return fail(404, "This symbol or timeframe is not available on your data plan.");
      return fail(502, "The data provider returned an error.");
    }

    const candles = j.values
      .map((v) => ({
        t: Date.parse(v.datetime.includes(" ") ? v.datetime.replace(" ", "T") + "Z" : v.datetime + "T00:00:00Z"),
        o: parseFloat(v.open), h: parseFloat(v.high), l: parseFloat(v.low), c: parseFloat(v.close),
      }))
      .filter((c) => [c.t, c.o, c.h, c.l, c.c].every(Number.isFinite))
      .sort((a, b) => a.t - b.t);

    const ttl = INTERVALS[interval];
    res.setHeader("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 3}`);
    res.status(200).json({ candles });
  } catch (e) {
    fail(502, "Could not reach the data provider.");
  }
};
