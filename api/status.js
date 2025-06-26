import fetch from "node-fetch";
import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://stats.uptimerobot.com/H8lyexLCjy");
    const html = await response.text();
    const $ = cheerio.load(html);

    const dot = $(".psp-main-status-dot");
    const style = dot.attr("style") || "";

    const isGreen = style.includes("rgb(0, 191, 165)") || style.includes("#00bfa5");

    res.status(200).json({ isGreen });
  } catch (error) {
    res.status(500).json({ isGreen: false, error: "Fetch failed" });
  }
}