# Custom themes

Put your own themes here, e.g. `themes/custom/acme.css`, and request them with
`"options": { "theme": "acme" }`.

- Every `.css` file in this folder is ignored by git, so private or client-branded themes are
  never committed and `git pull` never overwrites them.
- Start from a copy of `../default.css` (or `../blue.css`) and change what you need. The
  default theme is always loaded first, so you can also keep only the lines you change.
- A custom theme with the same name as a built-in one (e.g. `blue.css`) replaces it.
- Files are read on every request: no restart or rebuild needed.
