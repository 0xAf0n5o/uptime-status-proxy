import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://stats.uptimerobot.com/H8lyexLCjy");
    const html = await response.text();
    const $ = cheerio.load(html);

    // Select the green dot element
    const dot = $(".psp-main-status-dot");

    // Check the parent container's text for the status message
    const parentText = dot.closest(".uk-flex").text().toLowerCase();

    const isGreen =
      parentText.includes("all systems operational") ||
      parentText.includes("todos os sistemas estão operacionais") ||
      parentText.includes("tous les systèmes sont opérationnels");

    res.status(200).json({ isGreen });
  } catch (error) {
    res.status(500).json({ isGreen: false, error: "Fetch or parse failed" });
  }
}