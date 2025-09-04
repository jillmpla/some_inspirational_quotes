//app.js - main logic
//update const NUMBERED_IMAGE_COUNT   = 111; if you add more images
//this was hardcoded for speed/performance!

(function () {
    //cache DOM elements
    const hero        = document.querySelector('.hero, .intro') || document.body;
    const quoteText   = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const btnNew      = document.getElementById('btnNew');
    const btnCopy     = document.getElementById('btnCopy');
    const btnShare    = document.getElementById('btnShare');

    //parse the global quotes array into {text, author} objects
    const legacy = (window.quotes && Array.isArray(window.quotes)) ? window.quotes : [];
    const QUOTES = legacy.map((s) => {
        //split on the first "<br><br>" into text + author; strip leftover tags
        const parts  = String(s).split(/<br\s*\/?><br\s*\/?>(.*)/i);
        const text   = parts[0]?.replace(/<br\s*\/?>(?!<br)/gi, ' ').trim() || String(s).trim();
        const author = (parts[1] || '').replace(/<[^>]*>/g, '').trim() || 'Unknown';
        return { text, author };
    }).filter(q => q.text.length > 0);

    //images: hardcoded numbered JPGs for speed
    const HAS_IMAGES_ARRAY       = Array.isArray(window.images) && window.images.length > 0;
    //actual number of images in the image folder
    const NUMBERED_IMAGE_COUNT   = 218; //!!!!!!!!!!!!!!UPDATE THIS IF YOU ADD MORE IMAGES TO THE image folder!!!!!!!!!!!!!!
    const TOTAL_IMAGE_COUNT      = HAS_IMAGES_ARRAY ? window.images.length : NUMBERED_IMAGE_COUNT;

    //turn an index into a concrete URL
    const imagePath = (i) => HAS_IMAGES_ARRAY ? window.images[i] : `image/${i}.jpg`;

    //tiny preload helper (warms the cache for the next background)
    function preload(src) { const img = new Image(); img.src = src; }

    //create a shuffler that returns each index once before repeating
    function makeShuffler(n) {
        let bag = Array.from({ length: n }, (_, i) => i);
        return function next() {
            if (bag.length === 0) bag = Array.from({ length: n }, (_, i) => i);
            const idx = Math.floor(Math.random() * bag.length);
            const val = bag[idx];
            bag.splice(idx, 1);
            return val;
        };
    }

    const nextQuoteIndex = makeShuffler(QUOTES.length || 1);
    const nextImageIndex = makeShuffler(TOTAL_IMAGE_COUNT);

    //set a background image (with decode() when available to reduce jank)
    async function setBackground(i) {
        const src = imagePath(i);
        const img = new Image();
        img.decoding = 'async';
        img.src = src;

        try { if ('decode' in img) await img.decode(); } catch {  }

        if (img.complete && img.naturalWidth > 0) {
            hero.style.backgroundImage = `url('${src}')`;
        } else {
            img.onload = () => { hero.style.backgroundImage = `url('${src}')`; };
        }

        const j = nextImageIndex();
        preload(imagePath(j));
    }

    //render quote text/author and keep the share button in sync
    function renderQuote(q) {
        quoteText.textContent = q.text;
        quoteAuthor.textContent = q.author;

        if (btnShare) btnShare.disabled = !navigator.share;
    }

    //show a new quote + swap background
    let cooldown = false;
    function newQuote() {
        if (!QUOTES.length || cooldown) return;

        cooldown = true;
        renderQuote(QUOTES[nextQuoteIndex()]);
        setBackground(nextImageIndex());

        if (btnNew) btnNew.focus({ preventScroll: true });

        setTimeout(() => { cooldown = false; }, 250);
    }

    //copy the current quote to the clipboard
    async function copyQuote() {
        const text = `"${quoteText.textContent}" — ${quoteAuthor.textContent}`;
        try {
            await navigator.clipboard.writeText(text);
            flash(btnCopy, "Copied!");
        } catch {
            flash(btnCopy, "Press Ctrl+C");
        }
    }

    //share using the Web Share API
    async function shareQuote() {
        if (!navigator.share) return;
        const text = `"${quoteText.textContent}" — ${quoteAuthor.textContent}`;
        try {
            await navigator.share({ text });
        } catch {
        }
    }

    //quick button feedback helper
    function flash(el, msg) {
        if (!el) return;
        const prev = el.textContent;
        el.textContent = msg;
        el.disabled = true;
        setTimeout(() => { el.textContent = prev; el.disabled = false; }, 900);
    }

    if (btnNew)   btnNew.addEventListener("click", newQuote);
    if (btnCopy)  btnCopy.addEventListener("click", copyQuote);
    if (btnShare) btnShare.addEventListener("click", shareQuote);

    //keyboard shortcut: press "N" for a new quote
    window.addEventListener("keydown", (e) => {
        if (e.key && e.key.toLowerCase() === "n") {
            e.preventDefault();
            newQuote();
        }
    });

    //initial render: show quote and background immediately
    if (QUOTES.length) {
        renderQuote(QUOTES[nextQuoteIndex()]);
        setBackground(nextImageIndex());
    } else {
        renderQuote({
            text: "Add your quotes array to window.quotes to get started.",
            author: "— App",
        });
    }
})();



