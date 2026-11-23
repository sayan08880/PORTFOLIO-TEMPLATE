# Portfolio Template (Local-Only)

A fully client-side portfolio template. No backend, no Firebase, no database.  
All content is stored in the browser’s **localStorage** and can be edited through the built-in Admin panel.

---

## What’s Included

| Page            | Purpose                          |
|-----------------|----------------------------------|
| `index.html`    | Home / hero                      |
| `about.html`    | About section                    |
| `project.html`  | Projects gallery                 |
| `skill.html`    | Skills                           |
| `cv.html`       | CV / resume view                 |
| `contact.html`  | Contact info                     |
| `contactus.html`| Contact form                     |
| `admin.html`    | Content management panel         |

Supporting files: CSS, JS, `logo.png`, `placeholder.svg`.

---

## 1. How to Set Up

### Recommended – one command (`server.py`)

1. Open a terminal in the project folder (`PORTFOLIO-V5`).
2. Run:

   ```bash
   python3 server.py
   ```

   Optional custom port:

   ```bash
   python3 server.py 9000
   ```

3. The script will:
   - Start a local server
   - Automatically open **two browser tabs**:
     - Portfolio home (`index.html`)
     - Admin panel (`admin.html`)
4. To stop the server, press `Ctrl + C` in the terminal.

### Manual Python server (alternative)

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/`
- `http://localhost:8080/admin.html`

### Other tools

- **VS Code / Cursor**: Live Server extension
- **Node.js**: `npx serve .`

> **Why a local server?**  
> `file://` can block or limit `localStorage` and some features. Always prefer a local server.

---

## 2. How to Use (Public Portfolio)

1. Start the local server (see above).
2. Visit the pages:
   - Home → `http://localhost:8080/` or `index.html`
   - About, Projects, Skills, CV, Contact – use the navigation links.
3. Content comes from **localStorage**.  
   On first visit you will see the default template text and the placeholder avatar.
4. Everything is local to the current browser and domain (`localhost:8080`).  
   Data does **not** sync across devices or other browsers unless you export/import JSON.

---

## 3. How to Edit Content (Admin Panel)

### Login

1. Go to: `http://localhost:8080/admin.html`
2. Password: **`admin`**
3. Click **Login**.

> The password is stored only in your browser (SHA-256 hash).  
> Default password is set the first time you open the admin page.

### Editing

After login you can edit:

- **Site & Social Links** – logo text, full name, profile image, GitHub / LinkedIn / etc.
- **Home Page** – greeting, title, tagline, button
- **About Page** – heading, subtitle, text
- **Projects** – add / edit / delete projects (title, description, image, link, tags)
- **Skills** – skill name + percentage bars
- **CV sections** – basic info, skills, project groups, education, languages
- **Contact** – email, phone, location, map embed URL, form labels
- **Theme** – background & text colors per page, accent color, font family
- **Raw JSON** – advanced full-data editor + Export / Import

### Saving changes

- Click **Save Changes** after editing.  
  Data is written to `localStorage` immediately.
- Open any public page (in the **same browser**) to see the updates.
- **Reset Defaults** restores the original template content (clears your custom data).

### Uploading images

- **Profile image**: use the “Upload Profile Image” field in the Site panel (or paste a data URL / path).
- **Project images**: each project row has an “Upload Image” control.  
  Uploaded images are converted to data URLs and stored inside the CMS data.

> Tip: Keep images reasonably small. Very large data URLs can hit browser `localStorage` limits (~5 MB typical).

### Export / Import (backup or move data)

1. In Admin → **Raw JSON Editor**.
2. **Export** downloads a `.json` file of your current data.
3. On another browser or machine: **Import** that file → **Save Changes**.

### Changing the admin password

There is no UI for this yet. To reset:

1. Open browser DevTools → Application / Storage → Local Storage.
2. Delete the key `portfolio_admin_pw_hash`.
3. Reload `admin.html` – the default password `admin` will be recreated.

---

## 4. Quick Start Checklist

```bash
# 1. Go into the project folder
cd PORTFOLIO-V5

# 2. Start server (opens Admin + Portfolio automatically)
python3 server.py

# Password for admin: admin
# Edit in Admin → click Save Changes → Index updates live (no refresh)
```

---


## New editing features

### Color pickers (Power Theme Controls)
Each theme color has a **color picker** plus a hex text field.  
Change either one — they stay in sync. Click **Save Changes** to apply.

### Profile photo crop
1. In Admin → **Site & Social Links**
2. Choose **Upload Profile Image**
3. The crop modal opens (circle crop, 1:1)
4. Drag / resize, then **Apply Crop**
5. Click **Save Changes**

You can also click **Crop Photo** later on an already-loaded image.

### Live updates (no refresh)
When Admin and Portfolio are open in the **same browser**:

1. Edit content in Admin
2. Click **Save Changes**
3. The portfolio tab updates automatically (storage event)

No manual page refresh needed.

## 5. Technical Notes

- **Storage key**: `portfolio_cms_v1` (localStorage).
- **No backend** – everything runs in the browser.
- Contact form uses [FormSubmit.co](https://formsubmit.co). Change the target email in Admin → Contact.
- Design, CSS, page transitions, and icon fallbacks are preserved from the original template.
- Profile image fallback: `placeholder.svg`.

---

## 6. File Overview (for developers)

| File                  | Role                                      |
|-----------------------|-------------------------------------------|
| `portfolio-data.js`   | Default data + localStorage get/save API  |
| `portfolio-render.js` | Applies CMS data to the public pages      |
| `admin.js` / `admin.html` / `admin.css` | Local admin UI                     |
| `page-transition.js`  | Page transition effects                   |
| `icon-fallback.js`    | Offline Font Awesome fallback             |
| `theme-overrides.css` | Theme CSS variables                       |

---

Enjoy customizing the template.  
Open `admin.html`, log in with **admin**, and make it yours.
