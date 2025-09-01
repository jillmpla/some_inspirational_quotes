# Some Inspirational Quotes 🎇

A lightweight web app that displays **random inspirational quotes** on **beautiful background images**.

---

## 🔗 Live Site
[https://someinspirationalquotes.com](https://someinspirationalquotes.com)

---

## ✨ Features
- Random quotes, preloaded from `quotesmov.js`
- Background images shuffle without repeats (until a cycle finishes)
- Keyboard shortcut: press **N** for a new quote
- One-click **Copy** and Web **Share** support
- Responsive layout, good contrast, and accessible semantics

---

## ⚙️ How It Works
- **`quotesmov.js`**  
  Data-only file that sets `window.quotes = [ "Quote<br><br>Author", ... ]`.  
  `app.js` parses each item into `{ text, author }`.

- **`app.js`**
    - Non-repeating shuffler for quotes & backgrounds
    - Preloads upcoming background for smoother transitions
    - Renders quote & author into the DOM
    - Handles **Copy**, **Share**, **Tweet**, and the **N** key

- **Images**  
  Default pattern: `/image/0.jpg` … `/image/70.jpg`.  
  Or define `window.images = ["image/hero1.jpg", "image/hero2.jpg", ...]` to use explicit paths.

- **Styles (`quotesstyle.css`)**  
  Minimal, modern theme with a gradient header/footer and a glassy quote card. Mobile-friendly.

---

## 🎨 UI / UX

The design focuses on simplicity and readability:

- **Visual hierarchy:** Large serif quotes (Playfair Display) contrasted with sans-serif text (Inter) for headings and body.
- **Glassmorphism:** The quote card floats above the background with subtle blur, border, and shadow.
- **Backgrounds:** Fullscreen images cycle without repeats, dimmed with an overlay to preserve text legibility.
- **Responsive design:** Scales smoothly from desktop to tablet or mobile with flexible typography and controls.
- **Interactions:** Buttons provide hover/active feedback, visible focus states, and subtle brightness changes.

---

## ♿️ Accessibility
A few built-in accessibility features:

- **Descriptive labels:** Buttons use `aria-label` ("Get a new random quote", "Copy quote to clipboard", "Share quote")
- **Keyboard support:** Press **N** for a new quote; focus is managed back to the "New Quote" button
- **Skip link:** A "Skip to content" link jumps to `#main` for keyboard users
- **Focus styles:** Uses `:focus-visible` with a clear outline
- **Reduced motion:** Honors `prefers-reduced-motion: reduce` to avoid background transition animation

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE.txt).

You are free to use, modify, and distribute this code for personal or commercial use. Attribution is appreciated.

## If you find this project useful, consider giving it a star! ⭐

