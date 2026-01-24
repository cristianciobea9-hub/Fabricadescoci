# seo_audit_fabricadescoci

Utilitar CLI in Python 3.10+ pentru audit SEO al unui site static (HTML local). Scaneaza paginile, calculeaza scor, genereaza rapoarte si poate aplica automat remedieri in varianta `dist/`.

## Instalare rapida
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Rulare
```bash
python -m seo_audit_fabricadescoci \
  --src "/cale/catre/site" \
  --dist "./dist" \
  --report "./report" \
  --site-url "https://fabricadescoci.ro" \
  --product-pages "banda,produse,oferta" \
  --fix \
  --verbose
```

Daca nu vrei sa adaugi `rel="nofollow"` pe linkurile externe, foloseste `--no-nofollow`.

## Ce face
- Analizeaza titluri, descrieri, H1, imagini (alt), linkuri interne/externe, OG/Twitter, canonical, JSON-LD, continut, erori de linkuri relative.
- Calculeaza scor SEO 0-100 si listeaza fixuri sugerate.
- Genereaza rapoarte in `report/` (MD, HTML, CSV, JSON).
- In modul `--fix` scrie versiune corectata in `dist/`, adauga canonical, meta description, alt, lazy-loading, nofollow pe externe, JSON-LD minimal, sitemap si robots.txt.

## Teste
```bash
pip install pytest
pytest seo_audit_fabricadescoci/tests
```

## Note
- Nu modifica fisierele sursa; toate iesirile se scriu in `dist/` si `report/`.
- Necesita doar fisiere locale, fara acces la internet.
