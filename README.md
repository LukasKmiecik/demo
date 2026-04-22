# Demo systemu serwisowego 3D pod GitHub Pages

Ta paczka jest przygotowana jako statyczna strona demo do wrzucenia na GitHub Pages.

## Co jest w środku

- `index.html` — strona startowa demo
- `style.css` — stylowanie
- `js/app.js` — logika sceny 3D, lista komponentów i panel szczegółów
- `dane/komponenty-demo.json` — dane komponentów demo
- `assets/silownik-infografika.png` — karta komponentu
- `assets/modele/silownik_belimo/asd_github_ready.glb` — model GLB gotowy do Three.js
- `assets/metadane/asd_github_ready.json` — metadane modelu

## Co zostało poukładane

Model siłownika został wpięty do projektu jako prawdziwy plik GLB. Demo próbuje go wczytać dla komponentu `actuator-01`. Jeśli ładowanie się nie uda, system automatycznie pokaże prostą bryłę zastępczą.

## Publikacja na GitHub Pages

1. Utwórz repozytorium na GitHub.
2. Wrzuć zawartość folderu `github-demo` do repozytorium.
3. Wejdź w `Settings -> Pages`.
4. Wybierz publikację z gałęzi `main` i folderu `/root`.
5. Zapisz ustawienia.

## Następny krok

Najbardziej sensowne teraz jest dodanie:
- panelu dokumentacji PDF,
- prawdziwych nazw punktów IO,
- oddzielnych plików komponentów JS,
- następnych modeli GLB.
