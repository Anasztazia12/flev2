function isEnglishPage() {
    return document.documentElement.lang === 'en';
}

function toggleMenu() {
    var menu = document.getElementById('menuItems');
    var toggleBtn = document.querySelector('.hamburger-icon');
    var isOpen = menu.classList.toggle('open');
    toggleBtn.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', isEnglishPage()
        ? (isOpen ? 'Close menu' : 'Open menu')
        : (isOpen ? 'Menü bezárása' : 'Menü megnyitása'));
}

document.addEventListener('DOMContentLoaded', function () {
    var revealEls = document.querySelectorAll('.reveal');

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) {
        observer.observe(el);
    });

    initChatbot();
    initContactForm();
    syncHouseAnimation();
    initStatCounters();
    initLightbox();
});

function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!lightbox || !lightboxImage || !triggers.length) return;

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            var img = trigger.querySelector('img');
            lightboxImage.src = trigger.getAttribute('href');
            lightboxImage.alt = img ? img.alt : '';
            lightbox.classList.add('open');
        });
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    if (lightboxImage) lightboxImage.src = '';
}

function initStatCounters() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            } else {
                resetCounter(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(function (el) {
        observer.observe(el);
    });
}

function resetCounter(el) {
    el.dataset.animRunId = '';
    el.textContent = '0';
}

function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    var runId = String(Date.now()) + Math.random();
    el.dataset.animRunId = runId;

    function step(timestamp) {
        if (el.dataset.animRunId !== runId) return;
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

function syncHouseAnimation() {
    var houseMulti = document.querySelector('.house-multi');
    if (!houseMulti) return;

    var CYCLE_SECONDS = 50.1;
    var STORAGE_KEY = 'archHouseStart';

    var start = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!start) {
        start = Date.now();
        localStorage.setItem(STORAGE_KEY, String(start));
    }

    var path = window.location.pathname;
    var isHomePage = /(^|\/)index\.html$/.test(path) || /\/$/.test(path);

    var offset;
    if (isHomePage) {
        offset = 0;
    } else {
        var elapsed = (Date.now() - start) / 1000;
        offset = -(elapsed % CYCLE_SECONDS);
    }

    var animatedEls = houseMulti.querySelectorAll('.h-line, .h-fill, .h-side');
    animatedEls.forEach(function (el) {
        el.style.animationDelay = offset + 's';
    });
}

function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var wrapper = form.parentElement;
        var notice = document.createElement('div');
        notice.className = 'card';
        notice.setAttribute('role', 'status');
        notice.innerHTML = isEnglishPage()
            ? '<h2>Thank you for reaching out!</h2><p>Your message has been recorded, we will get in touch with you shortly.</p>'
            : '<h2>Köszönjük megkeresését!</h2><p>Üzenetét rögzítettük, hamarosan felvesszük Önnel a kapcsolatot.</p>';
        wrapper.replaceChild(notice, form);
    });
}

function toggleChat() {
    document.getElementById('chatbot').classList.toggle('open');
}

function initChatbot() {
    var messagesEl = document.getElementById('chatbotMessages');
    var inputEl = document.getElementById('chatbotInput');
    var sendBtn = document.getElementById('chatbotSend');
    if (!messagesEl || !inputEl || !sendBtn) return;

    var step = 'greeting';
    var lead = { name: '', email: '', phone: '' };
    var en = isEnglishPage();

    function addMessage(text, sender) {
        var msg = document.createElement('div');
        msg.className = 'chat-message ' + (sender === 'user' ? 'chat-user' : 'chat-bot');
        msg.textContent = text;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addMessage(en ? "Welcome! How can I help you?" : "Üdvözlöm! Miben segíthetek?");

    sendBtn.addEventListener('click', function () {
        var text = inputEl.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        inputEl.value = '';

        switch (step) {
            case 'greeting':
                step = 'name';
                addMessage(en ? "Thanks for reaching out! Could I get your name?" : "Köszönöm a megkeresést! Elkérhetném a nevét?");
                break;

            case 'name':
                lead.name = text;
                step = 'email';
                addMessage(en ? ("Thanks, " + lead.name + "! What email address can we reach you at?") : ("Köszönöm, " + lead.name + "! Milyen e-mail címen érhetjük el?"));
                break;

            case 'email':
                if (text.includes("@") && text.includes(".")) {
                    lead.email = text;
                    step = 'phone';
                    addMessage(en ? "Thank you! Could I also get a phone number where we can reach you?" : "Köszönöm! Kaphatnék egy telefonszámot is, ahol elérhetünk?");
                } else {
                    addMessage(en ? "That doesn't look like a valid email address. Please try again." : "Ez nem tűnik érvényes e-mail címnek. Kérem, próbálja újra.");
                }
                break;

            case 'phone':
                lead.phone = text;
                step = 'done';
                addMessage(en ? "Thank you for reaching out! Our colleague will contact you within a few days." : "Köszönjük megkeresését! Kollégánk pár napon belül felveszi Önnel a kapcsolatot.");
                break;

            default:
                addMessage(en ? "Thank you, our colleague will be in touch shortly." : "Köszönjük, kollégánk hamarosan jelentkezik Önnél.");
        }
    });

    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendBtn.click();
    });
}
