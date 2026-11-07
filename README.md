# Mozambique Country Guide

A static, multi-page website about Mozambique: its history, geography, wildlife, languages and peoples.

There is no build step and there are no dependencies. It is plain HTML, CSS and JavaScript, with Google Fonts loaded over CDN.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing with GitHub Pages

`index.html` sits at the root of the repository, so GitHub Pages can serve the site as it is. In the repository on GitHub, open **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save. The site appears at `https://<your-username>.github.io/Mozambique-Country-Guide/` after a minute or two.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Hero with a region-shaded province map, twelve key facts, five turning points, section links, the flag explained, a seven-question quiz |
| `history.html` | Ten eras from the first farmers to 2025 as a dated timeline with sticky era navigation, key figures, and the public holidays that mark historical events |
| `geography.html` | Interactive province map with layer toggles and a province panel, landforms, rivers and lakes, climate and cyclones, coast and islands, natural resources |
| `wildlife.html` | Map of parks and reserves linked to their descriptions, the Gorongosa recovery and its tuskless elephants, 20 species with a habitat filter and six primates, each with a photo, a seasonal calendar, photo credits |
| `languages.html` | Bar chart of first languages from the 2017 census (with a table view), where each language is spoken, Mozambican Portuguese words, greetings in five languages, language policy |
| `peoples.html` | Sixteen peoples with a region filter, other communities, religion, and culture: music, art, dress, food, literature and sport |

## Files

- `styles.css`: design tokens (light and dark), layout, and every component
- `script.js`: navigation, the map renderer, province panel, park map, card filters, era tracking, the language chart and the quiz. Each module checks for its own markup, so one file serves every page.
- `map-data.js`: projected SVG paths for provinces, neighbouring countries, lakes and rivers
- `images/wildlife/`: 26 animal photos (500 px wide) from Wikimedia Commons. Each photographer and licence is credited in the "Photo credits" section at the bottom of `wildlife.html`.
- `flag.svg`: the flag of Mozambique, used as the header logo and in the home page's "Reading the flag" section. From [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Mozambique.svg) (public domain).

## Map data

Province boundaries come from [geoBoundaries](https://www.geoboundaries.org/) (gbOpen, CC BY 4.0). Neighbouring countries, lakes and rivers come from [Natural Earth](https://www.naturalearthdata.com/) (public domain). The geometry was projected with an equirectangular projection scaled for 18.5°S, simplified, and stored as SVG path strings. Labels, cities and park pins are placed by latitude and longitude with the same projection in `script.js`.

## Notes

Language shares are from the 2017 census as summarised in the CIA World Factbook; other figures are rounded and cited in the text.
