# Backend oferta (PHP)

Endpoint: `/api/oferta` (Apache va servi `api/oferta/index.php`).

## Deploy pe cPanel (public_html)
1. Copiaza folderele `api/` si `data/` in `public_html/` **doar daca hosting-ul nu permite alta locatie**. Recomandare: muta `data/` in afara `public_html/` si seteaza `data_root` in `backend/config.php` (vezi mai jos).
2. Verifica permisiunile pentru `data/cereri`, `data/uploads`, `data/ratelimit` (scriere pentru PHP).
3. In `api/oferta/index.php`, seteaza:
   - `$adminEmail`
   - `$fromEmail`
4. (Optional recomandat) Creeaza `backend/config.php` cu:
   ```php
   <?php return ['data_root' => '/home/USER/private/data']; // cale absoluta, de preferat in afara public_html
   ```
5. Testeaza trimiterea formularului din `oferta.html`.

`data/.htaccess` blocheaza accesul public la fisierele salvate.

## SMTP (optional)
Daca hostingul nu permite `mail()` sau vrei SMTP autentic:
1. Creeaza un cont de email in cPanel (ex: `comenzi@fabricadescoci.ro`).
2. Noteaza setarile SMTP din cPanel (host, port, user, parola).
3. Instaleaza PHPMailer in `api/oferta/` (Composer sau upload manual).
4. Inlocuieste functia `send_mail()` din `api/oferta/index.php` cu implementarea SMTP PHPMailer.
5. Stocheaza creditele in variabile de mediu sau intr-un fisier separat (ex: `api/oferta/smtp.env.php`) care nu este in Git.

Exemplu variabile (nu include parole in repo):

```
SMTP_HOST=smtp.fabricadescoci.ro
SMTP_PORT=587
SMTP_USER=comenzi@fabricadescoci.ro
SMTP_PASS=parola-ta
SMTP_FROM=no-reply@fabricadescoci.ro
```

## Exemplu payload JSON

```json
{
  "requestId": "OF-20250109-1234",
  "createdAt": "2025-01-09 14:30 (Europe/Bucharest)",
  "client": {
    "type": "firma",
    "fullName": "",
    "companyName": "Exemplu SRL",
    "cui": "RO12345678",
    "regCom": "J40/1234/2020",
    "contactPerson": "Andrei Pop",
    "phone": "0740123456",
    "email": "office@example.ro",
    "locality": "Bucuresti",
    "county": "Bucuresti",
    "country": "Romania",
    "address": "Str. Exemplu 10",
    "addressNotes": "" 
  },
  "product": {
    "tapeType": "PP solvent",
    "width": "48 mm",
    "length": "66 m",
    "thickness": "50 microni",
    "color": "maro",
    "adhesive": "standard"
  },
  "print": {
    "enabled": true,
    "text": "FRAGIL - NU INCLINATI",
    "colors": ["negru", "portocaliu"],
    "colorOther": "",
    "colorCount": "2",
    "repeat": "40 cm",
    "position": "centru",
    "noLogoLater": false
  },
  "quantity": {
    "rolls": "360",
    "packaging": "palet",
    "deadline": "standard"
  },
  "delivery": {
    "method": "curier",
    "city": "Bucuresti",
    "payment": "transfer",
    "vatInfo": "TVA: firma cu CUI (se aplica conform legislatiei)."
  },
  "files": [
    { "name": "logo.pdf", "size": 204800 }
  ],
  "meta": {
    "userAgent": "Mozilla/5.0",
    "page": "https://fabricadescoci.ro/oferta.html"
  }
}
```
