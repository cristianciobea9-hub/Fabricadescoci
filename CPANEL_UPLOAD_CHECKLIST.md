# CPANEL UPLOAD CHECKLIST

## Pași de test după upload
1) Acces securizat date
   - Deschide `https://domeniu.ro/data/` și `https://domeniu.ro/data/uploads/` → trebuie 403/404 (niciun listing, niciun fișier servit).
2) Permisiuni scriere
   - Trimite formularul scurt (`solicitare-oferta.html`) cu un fișier valid < 10MB (png/jpg/pdf). Așteptare: răspuns de succes, fișier salvat în `data/uploads/`, log cerere în `data/cereri/`.
3) Rate-limit 60s/IP
   - Trimite 2 cereri scurte consecutiv (<60s). A doua trebuie să răspundă cu 429/mesaj “Too many requests”.
4) mail()
   - La submit, verifică dacă ajunge emailul (inbox `comenzi@...`). Dacă nu, hosting blochează `mail()`; soluție: configurează SMTP în `api/oferta/index.php` sau via PHPMailer (vezi `backend/README.md`).
5) Console
   - DevTools → Console pe toate paginile (index, produse, banda-*, oferta, solicitare-oferta, contact) → 0 erori/0 log-uri neașteptate.
6) Responsive 320–390px
   - Inspect/Device toolbar la 320/360/375/390px: navbar și meniul mobil funcționale, hero text lizibil, carduri ne-tăiate, fără scroll orizontal.
7) Cache
   - Hard refresh (Ctrl+F5). Dacă modifici CSS/JS ulterior, atașează query version `?v=YYMMDD` pe link/script.

## Upload în `public_html`
- `.htaccess`
- `favicon.png`
- `index.html`, `produse.html`, `contact.html`, `oferta.html`, `solicitare-oferta.html`, `banda-alba.html`, `banda-maro.html`, `banda-personalizata.html`
- CSS: `style.css`, `oferta.css`
- JS: `main.js`, `oferta.js`
- Folders: `img/`, `api/` (inclusiv `oferta/index.php`), `backend/` (cu `config.example.php` și eventual `config.php`), `data/` (cu `.htaccess` și subfoldere uploads/ratelimit/cereri)

## Exclude din upload
- `__archive__/`, `__backup_before_cpanel__/`, `__backup_before_cpanel_final__/`
- `dist/`, `__dev_only/`
- Tooling/surse: `package.json`, `build.mjs`, `node_modules/` dacă apare
- Fișiere de sistem și junk: `.DS_Store`, `__MACOSX`
- Orice arhive/snapshot-uri suplimentare
