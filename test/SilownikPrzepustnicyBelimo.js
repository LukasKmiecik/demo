import { KomponentBazowy } from "../bazowe/KomponentBazowy.js";

export class SilownikPrzepustnicyBelimo extends KomponentBazowy {
  constructor(daneInstancji = {}, definicjaTypu = {}) {
    super(daneInstancji);

    this.typ = "SilownikPrzepustnicyBelimo";
    this.producent = "Belimo";

    this.model = definicjaTypu.model || "Belimo LM/TM";
    this.model3d = definicjaTypu.model3d || "/modele/komponenty/silownik_belimo.glb";
    this.dokumentacja = definicjaTypu.dokumentacja || [];

    this.parametry = {
      napiecieZasilania: definicjaTypu.parametry?.napiecieZasilania || "24V_AC_DC",
      trybSterowania: definicjaTypu.parametry?.trybSterowania || "dwustanowy",
      katPracyMax: definicjaTypu.parametry?.katPracyMax || 90,
      czasPelnegoRuchuSek: definicjaTypu.parametry?.czasPelnegoRuchuSek || 150,
      momentNm: definicjaTypu.parametry?.momentNm || 5,
      sprezynaPowrotna: definicjaTypu.parametry?.sprezynaPowrotna || false
    };

    this.wejscia = {
      zasilanie: false,
      sygnalOtworz: false,
      sygnalZamknij: false,
      sygnalAnalogowy: 0,
      sygnalStop: false,
      odblokowanieReczne: false
    };

    this.wyjscia = {
      pozycjaProcent: 0,
      otwarty: false,
      zamkniety: true,
      wRuchu: false,
      potwierdzeniePracy: false,
      sygnalZwrotny: 0
    };

    this.stanWewnetrzny = {
      pozycjaDocelowa: 0,
      pozycjaAktualna: 0,
      kierunekRuchu: "brak",
      czasOdStartuRuchu: 0,
      zablokowanyMechanicznie: false,
      osSprzegnieta: true
    };

    this.bledy = [];
    this.polaczoneObiekty = {
      przepustnicaId: daneInstancji.przepustnicaId || null
    };
  }

  ustawPozycjeDocelowa() {
    const tryb = this.parametry.trybSterowania;

    if (!this.wejscia.zasilanie) {
      this.stanWewnetrzny.pozycjaDocelowa = this.parametry.sprezynaPowrotna ? 0 : this.stanWewnetrzny.pozycjaAktualna;
      return;
    }

    if (tryb === "dwustanowy") {
      if (this.wejscia.sygnalOtworz) this.stanWewnetrzny.pozycjaDocelowa = 100;
      if (this.wejscia.sygnalZamknij) this.stanWewnetrzny.pozycjaDocelowa = 0;
    }

    if (tryb === "analogowy") {
      const wartosc = Math.max(0, Math.min(100, this.wejscia.sygnalAnalogowy));
      this.stanWewnetrzny.pozycjaDocelowa = wartosc;
    }

    if (tryb === "trzypunktowy") {
      if (this.wejscia.sygnalOtworz && !this.wejscia.sygnalZamknij) {
        this.stanWewnetrzny.kierunekRuchu = "otwieranie";
      } else if (this.wejscia.sygnalZamknij && !this.wejscia.sygnalOtworz) {
        this.stanWewnetrzny.kierunekRuchu = "zamykanie";
      } else {
        this.stanWewnetrzny.kierunekRuchu = "brak";
      }
    }
  }

  sprawdzBledy() {
    this.bledy = [];

    if (!this.wejscia.zasilanie) {
      this.bledy.push({
        kod: "BRAK_ZASILANIA",
        opis: "Siłownik nie ma zasilania"
      });
    }

    if (!this.stanWewnetrzny.osSprzegnieta) {
      this.bledy.push({
        kod: "BRAK_SPRZEZENIA_Z_OSIA",
        opis: "Siłownik nie jest poprawnie sprzężony z osią przepustnicy"
      });
    }

    if (this.stanWewnetrzny.zablokowanyMechanicznie) {
      this.bledy.push({
        kod: "BLOKADA_MECHANICZNA",
        opis: "Ruch siłownika zablokowany mechanicznie"
      });
    }

    if (this.wejscia.sygnalOtworz && this.wejscia.sygnalZamknij) {
      this.bledy.push({
        kod: "SPRZECZNE_SYGNALY",
        opis: "Jednocześnie podano sygnał otwierania i zamykania"
      });
    }
  }

  aktualizuj(deltaSek = 1) {
    this.ustawPozycjeDocelowa();
    this.sprawdzBledy();

    if (this.wejscia.odblokowanieReczne) {
      this.wyjscia.wRuchu = false;
      return;
    }

    if (this.bledy.some(b => b.kod === "BRAK_ZASILANIA" || b.kod === "BLOKADA_MECHANICZNA")) {
      this.wyjscia.wRuchu = false;
      return;
    }

    const aktualna = this.stanWewnetrzny.pozycjaAktualna;
    const docelowa = this.stanWewnetrzny.pozycjaDocelowa;

    if (Math.abs(docelowa - aktualna) < 0.5) {
      this.stanWewnetrzny.pozycjaAktualna = docelowa;
      this.wyjscia.wRuchu = false;
    } else {
      const predkoscNaSek = 100 / this.parametry.czasPelnegoRuchuSek;

      if (docelowa > aktualna) {
        this.stanWewnetrzny.pozycjaAktualna = Math.min(docelowa, aktualna + predkoscNaSek * deltaSek);
        this.stanWewnetrzny.kierunekRuchu = "otwieranie";
      } else {
        this.stanWewnetrzny.pozycjaAktualna = Math.max(docelowa, aktualna - predkoscNaSek * deltaSek);
        this.stanWewnetrzny.kierunekRuchu = "zamykanie";
      }

      this.wyjscia.wRuchu = true;
    }

    const p = this.stanWewnetrzny.pozycjaAktualna;

    this.wyjscia.pozycjaProcent = p;
    this.wyjscia.otwarty = p >= 99;
    this.wyjscia.zamkniety = p <= 1;
    this.wyjscia.potwierdzeniePracy = this.wejscia.zasilanie;
    this.wyjscia.sygnalZwrotny = p / 10;
  }
}
