# Lottie Scroll Steps

אפקט דסקטופ: הסקשן ננעץ (pin), הגלילה מריצה לוטי פריים-אחרי-פריים, המלל מתחלף לפי שלבים, וטיימליין עם נקודות מראה התקדמות. בלי jQuery ובלי snap.

## CodePen
- **HTML** – מה שבין `PEN HTML START` ל-`PEN HTML END` ב-`index.html`
- **CSS** – `style.css`
- **JS** – `script.js`
- **External Scripts** (Settings → JS, לפי הסדר):
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js`

## הכנת הלוטי (סנכרון)
מוסיפים ב-After Effects מרקרים (Composition markers) לפי השלבים:

```
1 Out | 2 In | 2 Out | 3 In | ... | N In
```

- בין `In` ל-`Out` = השלב "עומד" (המלל של השלב מוצג)
- בין `Out` ל-`In` הבא = מעבר (המלל מתחלף באמצע)

בלי מרקרים → חלוקה שווה אוטומטית.

## Hooks
| attribute | |
|---|---|
| `data-ls` | root – ננעץ |
| `data-ls-text` | מלל לכל שלב (אחד על השני) |
| `data-ls-step` | כפתורי ניווט (אופציונלי) |
| `data-ls-lottie` + `data-src` | הלוטי |

CSS מקבל `--ls-progress` (0→1, נקודה לנקודה) על ה-root – משמש ל-fill ול-indicator.

הגדרות ב-`DEFAULTS` ב-`script.js` (`scrollPerStep`, `fade`, `y`, `scrub`). Breakpoint: `992px` (ב-JS וב-CSS). מתחתיו הסקשן מוסתר.
