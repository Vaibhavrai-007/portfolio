# Vaibhav Kumar Rai Portfolio

Static, responsive portfolio website generated from the provided resume PDF only. Profile content is stored in `data.json` so it can be updated without editing the page structure.

## Files

- `index.html` - Website markup.
- `styles.css` - Responsive light/dark theme styling.
- `app.js` - Dynamic rendering, project filters, tabs, theme toggle, and contact form behavior.
- `data.json` - Resume content used by the site.
- `assets/portfolio-wallpaper.png` - Generated hero wallpaper used by the site.
- `Vaibhav_Kumar_Rai_Resume.pdf` - Downloadable resume.

## Run Locally

Because the site loads `data.json`, run it with a local server:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

If you are already in another folder, run the command inside this `portfolio` folder.

## Contact Form

The contact form stores each message in the browser's `localStorage` under `portfolio-messages` and opens the visitor's email client with a prefilled message to `Vaibhavrai769@gmail.com`.

For production email delivery without a backend, replace the `handleContactSubmit` logic in `app.js` with a Formspree or EmailJS endpoint.

## Deploy

### GitHub Pages

1. Push these files to a GitHub repository.
2. In the repository settings, enable Pages.
3. Select the branch and folder that contains `index.html`.

### Netlify

1. Drag and drop this folder into Netlify Deploys, or connect the repository.
2. No build command is required.
3. Publish directory: this folder.

### Vercel

1. Import the repository in Vercel.
2. Framework preset: Other.
3. Build command: leave empty.
4. Output directory: this folder.
