//app.js - main quote/background logic
(function () {
    //cache DOM elements to interact with
    const hero = document.querySelector('.hero, .intro') || document.body;
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const btnNew = document.getElementById('btnNew');
    const btnCopy = document.getElementById('btnCopy');
    const btnShare = document.getElementById('btnShare');
    const btnTweet = document.getElementById('btnTweet');

    //load quotes array (from quotesmov.js) and parse into objects
    const legacy = (window.quotes && Array.isArray(window.quotes)) ? window.quotes : [];
    const QUOTES = legacy.map((s) => {
        //split into text + author based on "<br><br>"
        const parts = String(s).split(/<br\s*\/?><br\s*\/?>(.*)/i);
        const text = parts[0]?.replace(/<br\s*\/?>(?!<br)/gi, ' ').trim() || String(s).trim();
        const author = (parts[1] || '').replace(/<[^>]*>/g, '').trim() || 'Unknown';
        return { text, author };
    }).filter(q => q.text.length > 0);

    //images: use explicit window.images[] if provided, else fallback
    const HAS_IMAGES_ARRAY = Array.isArray(window.images) && window.images.length > 0;
    const IMAGE_COUNT = HAS_IMAGES_ARRAY ? window.images.length : 71;

    const imagePath = (i) => HAS_IMAGES_ARRAY ? window.images[i] : `image/${i}.jpg`;

    //quick preload helper
    function preload(src) { const img = new Image(); img.src = src; }

    //returns a function that shuffles indices without repeats
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
    const nextImageIndex = makeShuffler(IMAGE_COUNT);

    //cache successful src lookups, so don’t probe every time
    const srcCache = new Map();

    function setBackground(i, attempts = 0) {
        //if explicit paths provided, use directly
        if (HAS_IMAGES_ARRAY) {
            const src = imagePath(i);
            preload(src);
            hero.style.backgroundImage = `url('${src}')`;
            preload(imagePath(nextImageIndex())); //preload next
            return;
        }

        if (srcCache.has(i)) {
            const cached = srcCache.get(i);
            preload(cached);
            hero.style.backgroundImage = `url('${cached}')`;
            return;
        }

        //try common extensions until one succeeds
        const exts = ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'];
        let applied = false;
        let pending = exts.length;

        for (const ext of exts) {
            const src = `image/${i}.${ext}`;
            const img = new Image();
            img.onload = () => {
                if (applied) return;
                applied = true;
                srcCache.set(i, src);
                hero.style.backgroundImage = `url('${src}')`;
                preload(imagePath(nextImageIndex())); //preload upcoming
            };
            img.onerror = () => {
                pending--;
                if (pending === 0 && !applied && attempts < 5) {
                    //try again with a different index if all failed
                    setBackground(nextImageIndex(), attempts + 1);
                }
            };
            img.src = src;
        }
    }

    //insert text/author into the page and update tweet/share buttons
    function renderQuote(q) {
        quoteText.textContent = q.text;
        quoteAuthor.textContent = q.author;

        const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent('“' + q.text + '” — ' + q.author)}`;
        if (btnTweet) btnTweet.href = tweet;
        if (btnShare) btnShare.disabled = !navigator.share;
    }

    //main action: show a new quote + background ---
    let cooldown = false; //short lockout to prevent spam clicks
    function newQuote() {
        if (!QUOTES.length || cooldown) return;
        cooldown = true;
        renderQuote(QUOTES[nextQuoteIndex()]);
        setBackground(nextImageIndex());
        btnNew && btnNew.focus({ preventScroll: true });
        setTimeout(() => { cooldown = false; }, 250);
    }

    //copy current quote to clipboard
    async function copyQuote() {
        const text = `"${quoteText.textContent}" — ${quoteAuthor.textContent}`;
        try {
            await navigator.clipboard.writeText(text);
            flash(btnCopy, "Copied!");
        } catch {
            flash(btnCopy, "Press Ctrl+C");
        }
    }

    //use Web Share API if available
    async function shareQuote() {
        if (!navigator.share) return;
        const text = `"${quoteText.textContent}" — ${quoteAuthor.textContent}`;
        try {
            await navigator.share({ text });
        } catch {}
    }

    //temporarily change button label to confirm action
    function flash(el, msg) {
        if (!el) return;
        const prev = el.textContent;
        el.textContent = msg;
        el.disabled = true;
        setTimeout(() => {
            el.textContent = prev;
            el.disabled = false;
        }, 900);
    }

    //buttons/events
    btnNew && btnNew.addEventListener("click", newQuote);
    btnCopy && btnCopy.addEventListener("click", copyQuote);
    btnShare && btnShare.addEventListener("click", shareQuote);

    //keyboard shortcut: "N" for new quote
    window.addEventListener("keydown", (e) => {
        if (e.key && e.key.toLowerCase() === "n") {
            e.preventDefault();
            newQuote();
        }
    });

    //initial render
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

