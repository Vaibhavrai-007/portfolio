# Vaibhav Kumar Rai Portfolio

Static, responsive portfolio website generated from the provided resume PDF only. Profile content is stored in `data.json` so it can be updated without editing the page structure.

🔗 **Live site:** https://vaibhavrai-007.github.io/portfolio/

## Files

* `index.html` - Website markup.
* `styles.css` - Responsive light/dark theme styling.
* `app.js` - Dynamic rendering, project filters, tabs, theme toggle, and contact form behavior.
* `data.json` - Resume content used by the site.
* `assets/portfolio-wallpaper.png` - Generated hero wallpaper used by the site.
* `Vaibhav_Kumar_Rai_Resume.pdf` - Downloadable resume.

## Run Locally

Because the site loads `data.json` via `fetch`, opening `index.html` directly in a browser won't work — it needs to be served over HTTP:

```
cd portfolio
python -m http.server 8080
```

Then open:

```
http://localhost:8080
```

## Contact Form

The contact form stores each message in the browser's `localStorage` under `portfolio-messages` and opens the visitor's email client with a prefilled message to `Vaibhavrai769@gmail.com`.

For production email delivery without a backend, replace the `handleContactSubmit` logic in `app.js` with a Formspree or EmailJS endpoint.

## Deploy (GitHub Pages)

1. Push these files to a GitHub repository.
2. In the repository settings, go to **Pages**.
3. Under **Source**, select the branch and folder that contains `index.html` (usually `main` / `root`).
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo-name>/`.

Any update pushed to that branch redeploys the site automatically within a minute or two.
