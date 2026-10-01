# Vaibhav Kumar Rai Portfolio

Static, responsive portfolio website generated from the provided resume PDF only. Profile content is stored in `data.json` so it can be updated without editing the page structure.

🔗 **Live site:** https://vaibhavrai-007.github.io/portfolio/

## Files

* `index.html` - Website markup.
* `styles.css` - Responsive light/dark theme styling.
* `app.js` - Dynamic rendering, project filters, tabs, theme toggle, and contact form behavior.
* `data.json` - Resume content used by the site.
* `certificates.html` - Dedicated Certifications subpage.
* `certificates.json` - Dynamic dataset for all certifications.
* `certificates.js` - Dynamic rendering, search, category filtering, lightbox modal, and domain section grouping for certificates.
* `assets/certificates/` - Directory storing certificate PDFs.
* `assets/portfolio-wallpaper.png` - Generated hero wallpaper used by the site.
* `Vaibhav_Kumar_Rai_Resume.pdf` - Downloadable resume.

## Run Locally

Because the site loads `data.json` and `certificates.json` via `fetch`, opening `index.html` directly in a browser won't work — it needs to be served over HTTP:

```
cd portfolio
python -m http.server 8080
```

Then open:

```
http://localhost:8080
```
or for certifications:
```
http://localhost:8080/certificates.html
```

## Adding a New Certificate

To add a new certificate without touching HTML or CSS:
1. Drop the certificate PDF into `assets/certificates/` (e.g. `assets/certificates/my-certificate.pdf`).
2. Open `certificates.json` and add a new entry to the array:
   ```json
   {
     "id": "my-new-cert",
     "name": "Name of the Certification",
     "issuer": "Coursera / Google / AWS / Meta / NPTEL",
     "issueDate": "March 2026",
     "year": 2026,
     "category": "Data Analytics",
     "credentialId": "CERT-ID-12345",
     "verifyUrl": "https://verification-link.com",
     "pdfUrl": "assets/certificates/my-certificate.pdf",
     "skills": ["Python", "SQL", "Power BI"]
   }
   ```
3. Save, commit, and push. The page will automatically render the new certificate, group it under the respective year, update the counter, and enable filtering & search for it.

## Contact Form

The contact form stores each message in the browser's `localStorage` under `portfolio-messages` and opens the visitor's email client with a prefilled message to `Vaibhavrai769@gmail.com`.

For production email delivery without a backend, replace the `handleContactSubmit` logic in `app.js` with a Formspree or EmailJS endpoint.

## Deploy (GitHub Pages)

1. Push these files to a GitHub repository.
2. In the repository settings, go to **Pages**.
3. Under **Source**, select the branch and folder that contains `index.html` (usually `main` / `root`).
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo-name>/`.

Any update pushed to that branch redeploys the site automatically within a minute or two.
