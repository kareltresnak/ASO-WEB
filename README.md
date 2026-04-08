# Project OMEGA: Interactive Narrative Architecture
**Digitální školní časopis: Život bez hranic**

Tato implementace představuje deterministický stavový automat simulující fyzické médium v digitálním prostoru. Projekt nevyužívá externí knihovny, čímž maximalizuje výkon skrze přímou manipulaci s DOM a GPU akcelerované transformace.

---

## 🏗 Technická Architektura

Jádrem systému je třída `MagazineController`, která zapouzdřuje logiku 3D manipulace, asynchronní stránkování a responzivní přepočty.

### 1. Kinematika a 3D Prostor
Prostředí využívá CSS vlastnost `perspective: 4000px`, která definuje hloubku scény. Každý list (`leaf`) funguje jako kontejner se dvěma plochami (`front`, `back`) využívajícími `backface-visibility: hidden`.

* **Transformační matice:** Rotace listů probíhá podél osy $Y$.
* **Z-index Management:** Systém dynamicky modifikuje `z-index` během animace, aby simuloval fyzické vrstvení papíru. Při listování vpřed se index zvyšuje, při listování vzad se po skončení animace vrací k původní hodnotě, aby zůstala zachována hierarchie hromady.

### 2. Geometrie a Dynamický Scaling
Metoda `calculateScale()` dynamicky dopočítává rozměry scény na základě aktuálního viewportu při zachování poměru stran standardu ISO 216 ($\sqrt{2}$):

$$targetH = \min(vh, \frac{vw}{aspectW} \cdot 1.414)$$

Kde $aspectW = 2$ představuje otevřenou dvoustranu.

---

## 🛠 Klíčové Funkce (Expert Mode)

* **Async Navigation Engine:** Metoda `goToLeaf()` implementuje `async/await` cyklus s intervalem 120ms. To umožňuje plynulé prolistování ("fast-forward") desítkami stran, aniž by došlo k zahlcení renderovacího vlákna.
* **Event Bubbling Isolation:** Kritický zásah v `handleLeafClick` pomocí `e.stopPropagation()` zajišťuje, že interakce s konkrétním listem neaktivuje globální triggery scény.
* **Adaptive HUD:** Ovládací panel (Glassmorphism) využívá `backdrop-filter: blur(24px)` a stavovou logiku pro přepínání mezi režimy `slider-group` a `rewind-group` podle indexu aktuální strany.
* **Keyboard Interactivity:** Plná podpora pro $ArrowRight$, $ArrowLeft$ a $Escape$ (zavření) pro power-usery.

---

## 📖 Narativní Kontext
> *"All the world's a stage, and all the men and women merely players."* > — William Shakespeare, *As You Like It*

V kontextu tohoto projektu je `scene` jevištěm a kód scénářem. Přechod ze stavu `closed` do `open` není pouhou změnou třídy, ale kinematografickým úvodem, který vtahuje diváka do obsahu. Atmosféra je podpořena ambientním pozadím s gradientní sférou simulující hloubku prostoru.

---

## 🚀 Instalace a Konfigurace

1.  **Assets:** Obrázky stran umístěte do adresáře `/img` ve formátu `1.png` až `22.png`.
2.  **Inicializace:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => 
        new MagazineController('bookContainer', pagesData)
    );
    ```
3.  **Technické požadavky:** Moderní prohlížeč s podporou CSS Grid a Flexbox. Doporučeno pro zobrazení na zařízeních s vysokou hustotou pixelů.

---

## 🔴 Red Pen Critique (Analýza kvality)

* **Architektura:** Čistý Vanilla JS bez balastu. Skvělá implementace asynchronního listování.
* **UX:** Výborný handling mobilních zařízení přes dynamické `scale(0.65)` v Lobby stavu.
* **Kritika:** Implementace postrádá *pre-fetching* obrázků. U pomalého připojení může dojít k problikávání bílých stran. Doporučuji přidat `Intersection Observer` nebo jednoduchý preload sousedních stran pro absolutní plynulost zážitku.
* **Verdikt:** Technicky precizní řešení splňující akademické standardy pro pokročilý frontendový vývoj.