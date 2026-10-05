// ================= Config =================
const SUPABASE_URL = 'https://iwmvegctnlgjuvizhton.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QB9F7SYiCFpAtVxUELBv0g_IB-cFCWO';
const ANNIVERSARY = new Date(2023, 5, 7); // June 7, 2023 (months are 0-based)

const DAILY_QUESTIONS = [
    "What's your favorite memory of us so far?",
    "What made you smile today?",
    "Where in the world would you take me for a week?",
    "What's a song that reminds you of us?",
    "What's something new you want us to try together?",
    "What was your first impression of me?",
    "What's your idea of a perfect lazy day together?",
    "What's one thing I do that always makes you feel loved?",
    "If we had a theme song, what would it be?",
    "What's a food we have to eat together someday?",
    "What's your favorite thing about yourself?",
    "What's a dream you've never told anyone?",
    "What's the funniest moment we've had together?",
    "What's one small thing that would make your week better?",
    "What movie should we watch next together?",
    "What's something you're proud of this month?",
    "What do you think we'll be doing 5 years from now?",
    "What's your favorite way to spend a rainy day?",
    "What's a habit of mine you secretly find cute?",
    "If you could relive one day with me, which would it be?",
    "What's the best gift you've ever received?",
    "What's something that always cheers you up?",
    "Describe us in three words.",
    "What's a place from your childhood you want to show me?",
    "What's your love language, and has it changed?",
    "What's one thing you want to learn this year?",
    "What would our dream home look like?",
    "What's your go-to comfort food?",
    "What's something you've never done but want to do with me?",
    "What's the sweetest thing someone has done for you?",
    "What's your favorite photo of us and why?",
    "What's one goal we should set together?",
    "What's something about me that surprised you?",
    "What's your favorite season and why?",
    "If we started a business together, what would it be?",
    "What's a tradition you'd like us to start?",
    "What do you appreciate most about our relationship?",
    "What's your perfect date night?",
    "What's something that made you laugh this week?",
    "What's one thing you want me to know today?",
    "What was the moment you knew you liked me?",
    "What's your favorite thing we do together?",
    "If you could have any superpower, what would it be?",
    "What's a book, show, or game you want to share with me?",
    "Where do you feel most at peace?",
    "What's something you're looking forward to?",
    "What's a compliment you'll never forget?",
    "What's one thing we should do more often?",
    "What's the best advice you've ever gotten?",
    "What would you name our pet?",
    "What's your favorite smell?",
    "What's your favorite way to show love?",
    "What's something you want to thank me for?",
    "What would your perfect birthday look like?",
    "What's a memory that always makes you laugh?",
    "What's one thing on your bucket list?",
    "What's the most romantic thing you can imagine?",
    "How can I support you better this week?",
    "What's your favorite inside joke of ours?",
    "What's one word for how you feel about us today?",
];
const MOODS = ['😍', '🥰', '😊', '😌', '😐', '😔', '😢', '😤', '😴', '🤒', '🥳', '🤪'];
const REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
const LETTER_PRESETS = [
    'Open when you miss me',
    "Open when you're sad",
    "Open when you can't sleep",
    'Open when we had a fight',
    'Open when you need a laugh',
    'Open on our anniversary',
    "Open when you're stressed",
    'Open on your birthday',
];

// ================= Helpers =================
const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} },
};

let passcode = store.get('jn_passcode') || '';
let me = store.get('jn_me') || '';
const other = () => (me === 'Jes' ? 'Nica' : 'Jes');

async function rpc(name, args = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p: passcode, ...args }),
    });
    if (!res.ok) throw new Error(`${name} failed (${res.status})`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

const $ = (id) => document.getElementById(id);
function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key === 'style') node.style.cssText = value;
        else if (key === 'dataset') Object.assign(node.dataset, value);
        else node[key] = value;
    }
    for (const child of [].concat(children)) {
        if (child != null && child !== false) node.append(child);
    }
    return node;
}
function setStatus(id, text) { $(id).textContent = text; }

function pad(n) { return String(n).padStart(2, '0'); }
function toDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayStr() { return toDateStr(new Date()); }
function parseDate(str) {
    const [y, m, d] = str.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
}
function startOfToday() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function formatTime(iso) {
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return sameDay ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
function formatDate(str, opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) {
    return parseDate(str).toLocaleDateString([], opts);
}
function nextOccurrence(dateStr, yearly) {
    const today = startOfToday();
    const d = parseDate(dateStr);
    if (!yearly) return d;
    let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
    return next;
}
function daysLabel(days) {
    if (days === 0) return 'Today! 🎉';
    if (days === 1) return 'Tomorrow';
    if (days > 0) return `${days} days`;
    return `${-days} days ago`;
}
function shake(node) {
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
}

// Shrink photos in the browser before uploading so they load fast and fit the database.
function resizeImage(file, maxSide = 1600) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let quality = 0.85;
            let side = maxSide;
            let dataUrl;
            do {
                const scale = Math.min(1, side / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                quality -= 0.1;
                side = Math.round(side * 0.85);
            } while (dataUrl.length > 2500000 && quality > 0.3);
            resolve(dataUrl);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
        img.src = url;
    });
}

const photoCache = new Map();
function photoData(id) {
    if (!photoCache.has(id)) {
        photoCache.set(id, rpc('get_photo', { photo_id: id }).catch((err) => {
            photoCache.delete(id);
            throw err;
        }));
    }
    return photoCache.get(id);
}
function photoImg(id, props = {}) {
    const img = el('img', { alt: 'Photo', loading: 'lazy', ...props });
    photoData(id).then((src) => { if (src) img.src = src; }).catch(() => {});
    return img;
}

// Small reusable checklist row: checkbox, title + subtitle, delete button.
function checklistItem({ done, title, sub, onToggle, onDelete, lead }) {
    const parts = [];
    if (onToggle) {
        const box = el('input', { type: 'checkbox', checked: !!done });
        box.addEventListener('change', () => onToggle(box.checked));
        parts.push(box);
    }
    if (lead) parts.push(lead);
    parts.push(el('div', { className: 'body' }, [
        el('div', { className: 'title', textContent: title }),
        sub ? el('div', { className: 'sub', textContent: sub }) : null,
    ]));
    if (onDelete) {
        const del = el('button', { className: 'icon', textContent: '🗑', title: 'Delete' });
        del.addEventListener('click', onDelete);
        parts.push(del);
    }
    return el('li', { className: done ? 'done' : '' }, parts);
}

// ================= Gate =================
const gate = $('gate');
const site = $('site');

$('gateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const attempt = $('passcodeInput').value.trim();
    if (!attempt) return;
    $('enterButton').disabled = true;
    setStatus('gateError', '');
    try {
        passcode = attempt;
        const ok = await rpc('verify_passcode');
        if (ok) {
            store.set('jn_passcode', attempt);
            afterPasscode();
        } else {
            passcode = '';
            setStatus('gateError', 'Wrong passcode, try again 💔');
            shake($('gateForm'));
            $('passcodeInput').select();
        }
    } catch (err) {
        passcode = '';
        setStatus('gateError', "Couldn't connect. Check your internet and try again.");
    } finally {
        $('enterButton').disabled = false;
    }
});

function afterPasscode() {
    if (me) {
        enterSite();
    } else {
        $('passcodeStep').hidden = true;
        $('whoStep').hidden = false;
    }
}

document.querySelectorAll('[data-who]').forEach((btn) => {
    btn.addEventListener('click', () => {
        me = btn.dataset.who;
        store.set('jn_me', me);
        enterSite();
    });
});

function applyUser() {
    $('meName').textContent = me;
    $('settingsMe').textContent = me;
    $('otherName').textContent = other();
}

$('switchUser').addEventListener('click', () => {
    me = other();
    store.set('jn_me', me);
    applyUser();
    seenId = Number(store.get(`jn_seen_${me}`) || 0);
    renderChat();
    updateBadges();
    loadDaily();
    syncPushSub();
    const panel = currentPanel[currentSection];
    if (panel && loaders[panel]) loaders[panel]();
});

$('lockBtn').addEventListener('click', () => {
    store.remove('jn_passcode');
    location.reload();
});

// ================= Flower reveal =================
function playFlowers(done) {
    const cover = $('flowerCover');
    const flowers = ['🌸', '🌷', '🌺', '💐', '🌹', '🪷', '💮', '🌼'];
    cover.innerHTML = '';
    cover.classList.remove('reveal');
    cover.hidden = false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = Math.max(48, Math.min(w, h) / 6);
    const step = size * 0.7;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(cx, cy);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * step + (r % 2 ? step / 2 : 0) + (Math.random() - 0.5) * step * 0.4;
            const y = r * step + (Math.random() - 0.5) * step * 0.4;
            const dist = Math.hypot(x - cx, y - cy);
            const angle = Math.atan2(y - cy, x - cx);
            const f = el('span', { className: 'flower', textContent: flowers[(r * cols + c) % flowers.length] });
            f.style.left = `${x}px`;
            f.style.top = `${y}px`;
            f.style.fontSize = `${size * (0.85 + Math.random() * 0.4)}px`;
            f.style.animationDelay = `${(dist / maxDist) * 0.6}s`;
            f.style.setProperty('--rot', `${Math.round((Math.random() - 0.5) * 60)}deg`);
            f.style.setProperty('--dx', `${Math.cos(angle) * w}px`);
            f.style.setProperty('--dy', `${Math.sin(angle) * h}px`);
            cover.append(f);
        }
    }

    // Flowers fill the screen, then the site is revealed underneath and they blow away.
    setTimeout(() => {
        done();
        cover.classList.add('reveal');
        cover.querySelectorAll('.flower').forEach((f) => {
            f.style.animationDelay = `${Math.random() * 0.3}s`;
        });
        setTimeout(() => { cover.hidden = true; cover.innerHTML = ''; }, 1600);
    }, 1700);
}

function enterSite() {
    playFlowers(() => {
        gate.hidden = true;
        site.hidden = false;
        applyUser();
        if (!openFromHash()) window.scrollTo(0, 0);
    });
    seenId = Number(store.get(`jn_seen_${me}`) || 0);
    loadHome();
    loadSettings();
    syncPushSub();
}

// ================= Anniversary counter =================
function addMonths(date, months) {
    const d = new Date(date);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return d;
}

function anniversaryInfo() {
    const midnight = startOfToday();
    let next = new Date(midnight.getFullYear(), 5, 7);
    if (next < midnight) next = new Date(midnight.getFullYear() + 1, 5, 7);
    return { days: daysBetween(midnight, next), years: next.getFullYear() - ANNIVERSARY.getFullYear(), date: next };
}

function updateCounter() {
    const now = new Date();
    let months = (now.getFullYear() - ANNIVERSARY.getFullYear()) * 12 + (now.getMonth() - ANNIVERSARY.getMonth());
    if (addMonths(ANNIVERSARY, months) > now) months--;
    const anchor = addMonths(ANNIVERSARY, months);
    let rest = Math.floor((now - anchor) / 1000);
    const days = Math.floor(rest / 86400); rest -= days * 86400;
    const hours = Math.floor(rest / 3600); rest -= hours * 3600;
    const minutes = Math.floor(rest / 60);
    const seconds = rest - minutes * 60;

    $('cYears').textContent = Math.floor(months / 12);
    $('cMonths').textContent = months % 12;
    $('cDays').textContent = days;
    $('cHours').textContent = hours;
    $('cMinutes').textContent = minutes;
    $('cSeconds').textContent = seconds;
    $('totalDays').textContent = daysBetween(ANNIVERSARY, startOfToday()).toLocaleString();

    const ann = anniversaryInfo();
    $('nextAnniv').textContent = ann.days === 0
        ? `🎉 Happy ${ann.years}-year anniversary! 🎉`
        : `${ann.days} days until our ${ann.years}-year anniversary`;
}
updateCounter();
setInterval(updateCounter, 1000);

// ================= Navigation =================
let currentSection = 'home';
const currentPanel = { memories: 'photos', us: 'chat', plans: 'activities' };
const loaders = {}; // panel name -> load function, filled in below

function showSection(name) {
    currentSection = name;
    document.querySelectorAll('.main-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.section === name));
    document.querySelectorAll('.section').forEach((s) => { s.hidden = s.id !== `section-${name}`; });
    if (name === 'home') loadHome();
    if (name === 'settings') loadSettings();
    if (currentPanel[name]) showPanel(name, currentPanel[name]);
}

function showPanel(section, panel) {
    currentPanel[section] = panel;
    const sectionEl = $(`section-${section}`);
    sectionEl.querySelectorAll('.sub-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.panel === panel));
    sectionEl.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== `panel-${panel}`; });
    if (loaders[panel]) loaders[panel]();
}

document.querySelectorAll('.main-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});
document.querySelectorAll('.sub-tabs button').forEach((btn) => {
    const section = btn.closest('.section').id.replace('section-', '');
    btn.addEventListener('click', () => showPanel(section, btn.dataset.panel));
});
document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const [section, panel] = btn.dataset.goto.split(':');
        currentPanel[section] = panel;
        showSection(section);
        window.scrollTo(0, 0);
    });
});
const isPanelOpen = (section, panel) => !site.hidden && currentSection === section && currentPanel[section] === panel;

// ================= Home =================
$('revealButton').addEventListener('click', () => {
    $('punchline').classList.add('visible');
    $('revealButton').hidden = true;
});

function dailyIndex(dateStr = todayStr()) {
    return ((daysBetween(ANNIVERSARY, parseDate(dateStr)) % DAILY_QUESTIONS.length) + DAILY_QUESTIONS.length) % DAILY_QUESTIONS.length;
}

function loadHome() {
    $('homeQuestion').textContent = DAILY_QUESTIONS[dailyIndex()];
    loadPhotos();
    loadChat();
    loadOnThisDay();
    loadCountdowns();
}

async function loadOnThisDay() {
    const box = $('onThisDay');
    try {
        const items = await rpc('on_this_day', { d: todayStr() });
        box.innerHTML = '';
        if (!items.length) {
            box.append(el('p', { className: 'empty-note', textContent: 'Nothing from this day in past years yet. Keep making memories 💕' }));
            return;
        }
        const thisYear = new Date().getFullYear();
        // A milestone's photo would otherwise show up a second time on its own.
        const milestonePhotos = new Set(items.filter((i) => i.kind === 'milestone' && i.photo_id).map((i) => i.photo_id));
        for (const item of items) {
            if (item.kind === 'photo' && milestonePhotos.has(item.photo_id)) continue;
            const years = thisYear - parseDate(item.on_date).getFullYear();
            const when = `${years} year${years === 1 ? '' : 's'} ago`;
            let what;
            if (item.kind === 'photo') what = item.title || 'A photo from this day';
            else if (item.kind === 'milestone') what = `🌟 ${item.title}${item.body ? `\n${item.body}` : ''}`;
            else what = `💬 ${item.author}: ${item.body || '(photo)'}`;
            const img = item.photo_id ? photoImg(item.photo_id) : null;
            if (img) img.addEventListener('click', () => openViewer(img.src, what));
            box.append(el('div', { className: 'memory' }, [
                img,
                el('div', {}, [
                    el('div', { className: 'when', textContent: when }),
                    el('div', { className: 'what', textContent: what }),
                ]),
            ]));
        }
    } catch (err) {
        box.innerHTML = '';
        box.append(el('p', { className: 'empty-note', textContent: "Couldn't load memories." }));
    }
}

// ================= Photos =================
let allPhotos = [];
let photos = [];
let albumFilter = 'all';
let photoIndex = 0;
let homeIndex = 0;
let playing = false;
let playTimer = null;
let viewerMode = null; // 'slideshow' | 'single'

const myFavKey = () => (me === 'Jes' ? 'fav_jes' : 'fav_nica');

async function loadPhotos() {
    try {
        allPhotos = await rpc('photo_list');
        applyAlbumFilter();
    } catch (err) {
        setStatus('uploadStatus', "Couldn't load photos.");
    }
}
loaders.photos = loadPhotos;

function applyAlbumFilter() {
    const albums = [...new Set(allPhotos.map((p) => p.album))].sort();
    if (albumFilter !== 'all' && albumFilter !== 'fav' && !albums.includes(albumFilter)) albumFilter = 'all';
    photos = albumFilter === 'all' ? allPhotos
        : albumFilter === 'fav' ? allPhotos.filter((p) => p.fav_jes || p.fav_nica)
        : allPhotos.filter((p) => p.album === albumFilter);
    if (photoIndex >= photos.length) photoIndex = Math.max(0, photos.length - 1);

    const chips = $('albumChips');
    chips.innerHTML = '';
    const options = [['all', `All (${allPhotos.length})`], ['fav', '❤️ Favorites'], ...albums.map((a) => [a, a])];
    for (const [key, label] of options) {
        const b = el('button', { textContent: label, className: key === albumFilter ? 'active' : '' });
        b.addEventListener('click', () => { albumFilter = key; photoIndex = 0; applyAlbumFilter(); });
        chips.append(b);
    }
    const list = $('albumList');
    list.innerHTML = '';
    for (const a of new Set(['Everyday', 'Trips', 'Dates', 'Silly', 'Holidays', ...albums])) list.append(el('option', { value: a }));

    renderPhotos();
}

async function showInFrame(frame, captionEl, list, index) {
    frame.querySelectorAll('img').forEach((img) => img.remove());
    frame.querySelector('.empty').hidden = list.length > 0;
    if (!list.length) {
        captionEl.textContent = '';
        return;
    }
    const photo = list[index];
    captionEl.textContent = photo.caption || '';
    const img = el('img', { alt: photo.caption || 'Our photo' });
    img.style.opacity = '0';
    img.onload = () => { img.style.opacity = '1'; };
    frame.prepend(img);
    try {
        img.src = await photoData(photo.id);
    } catch (err) {
        img.remove();
    }
}

function renderPhotos() {
    $('prevPhoto').hidden = $('nextPhoto').hidden = photos.length < 2;
    showInFrame($('photoSlideshow'), $('photoCaption'), photos, photoIndex);
    const photo = photos[photoIndex];
    if (photo) {
        const date = photo.taken_on ? formatDate(photo.taken_on, { month: 'short', day: 'numeric', year: 'numeric' }) : formatTime(photo.created_at);
        const hearts = [photo.fav_jes && 'Jes', photo.fav_nica && 'Nica'].filter(Boolean);
        $('photoMeta').textContent = `${photoIndex + 1} of ${photos.length} · ${photo.album} · ${date}`
            + (photo.created_by ? ` · added by ${photo.created_by}` : '')
            + (hearts.length ? ` · ❤️ ${hearts.join(' & ')}` : '');
        $('favBtn').textContent = photo[myFavKey()] ? '❤️ Favorited' : '🤍 Favorite';
    } else {
        $('photoMeta').textContent = '';
        $('favBtn').textContent = '🤍 Favorite';
    }
    $('editPhotoForm').hidden = true;

    const thumbs = $('thumbs');
    thumbs.innerHTML = '';
    photos.forEach((p, i) => {
        const del = el('button', { className: 'del', textContent: '✕', title: 'Delete photo' });
        del.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm('Delete this photo?')) return;
            try {
                await rpc('delete_photo', { photo_id: p.id });
                photoCache.delete(p.id);
                await loadPhotos();
            } catch (err) {
                setStatus('uploadStatus', "Couldn't delete that photo.");
            }
        });
        const heart = (p.fav_jes || p.fav_nica) ? el('span', { className: 'heart', textContent: '❤️' }) : null;
        const thumb = el('div', { className: `thumb${i === photoIndex ? ' current' : ''}` }, [photoImg(p.id, { alt: p.caption || 'Photo' }), heart, del]);
        thumb.addEventListener('click', () => { photoIndex = i; renderPhotos(); });
        thumbs.append(thumb);
    });
    renderHomePhoto();
}

function renderHomePhoto() {
    if (homeIndex >= allPhotos.length) homeIndex = 0;
    showInFrame($('homeSlideshow'), $('homeCaption'), allPhotos, homeIndex);
}

function stepPhoto(delta) {
    if (!photos.length) return;
    photoIndex = (photoIndex + delta + photos.length) % photos.length;
    renderPhotos();
    if (viewerMode === 'slideshow') renderFullscreen();
}
$('prevPhoto').addEventListener('click', () => stepPhoto(-1));
$('nextPhoto').addEventListener('click', () => stepPhoto(1));

function setPlaying(on) {
    playing = on && photos.length > 1;
    $('playPause').textContent = playing ? '⏸ Pause' : '▶ Play';
    clearInterval(playTimer);
    if (playing) playTimer = setInterval(() => stepPhoto(1), 4000);
}
$('playPause').addEventListener('click', () => setPlaying(!playing));

setInterval(() => {
    if (allPhotos.length > 1 && currentSection === 'home' && !site.hidden) {
        homeIndex = (homeIndex + 1) % allPhotos.length;
        renderHomePhoto();
    }
}, 5000);

$('favBtn').addEventListener('click', async () => {
    const photo = photos[photoIndex];
    if (!photo) return;
    const key = myFavKey();
    photo[key] = !photo[key];
    renderPhotos();
    try {
        await rpc('set_photo_fav', { photo_id: photo.id, who: me, is_fav: photo[key] });
    } catch (err) {
        photo[key] = !photo[key];
        renderPhotos();
    }
});

$('editPhotoBtn').addEventListener('click', () => {
    const photo = photos[photoIndex];
    if (!photo) return;
    $('editCaption').value = photo.caption || '';
    $('editAlbum').value = photo.album || '';
    $('editDate').value = photo.taken_on || '';
    $('editPhotoForm').hidden = false;
});
$('cancelEditPhoto').addEventListener('click', () => { $('editPhotoForm').hidden = true; });
$('editPhotoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const photo = photos[photoIndex];
    if (!photo) return;
    try {
        await rpc('update_photo', {
            photo_id: photo.id,
            caption: $('editCaption').value,
            album: $('editAlbum').value,
            taken_on: $('editDate').value || null,
        });
        await loadPhotos();
        const idx = photos.findIndex((p) => p.id === photo.id);
        if (idx >= 0) { photoIndex = idx; renderPhotos(); }
    } catch (err) {
        setStatus('uploadStatus', "Couldn't save changes.");
    }
});

// Fullscreen viewer: either the slideshow or a single image (chat/timeline photos).
async function renderFullscreen() {
    const photo = photos[photoIndex];
    if (!photo) return;
    $('fullscreenCaption').textContent = photo.caption || '';
    try { $('fullscreenImg').src = await photoData(photo.id); } catch (err) {}
}
function openViewer(src, caption = '') {
    if (!src) return;
    viewerMode = 'single';
    $('fullscreenImg').src = src;
    $('fullscreenCaption').textContent = caption;
    $('fullscreenShow').hidden = false;
}
$('fullscreenBtn').addEventListener('click', () => {
    if (!photos.length) return;
    viewerMode = 'slideshow';
    $('fullscreenShow').hidden = false;
    renderFullscreen();
    setPlaying(true);
});
function closeViewer() {
    $('fullscreenShow').hidden = true;
    if (viewerMode === 'slideshow') setPlaying(false);
    viewerMode = null;
}
$('closeFullscreen').addEventListener('click', closeViewer);
$('fullscreenImg').addEventListener('click', () => { if (viewerMode === 'slideshow') stepPhoto(1); });
document.addEventListener('keydown', (e) => {
    if (!$('letterModal').hidden && e.key === 'Escape') $('closeLetter').click();
    if (!viewerMode) return;
    if (e.key === 'ArrowRight') stepPhoto(1);
    if (e.key === 'ArrowLeft') stepPhoto(-1);
    if (e.key === 'Escape') closeViewer();
});

$('uploadBtn').addEventListener('click', async () => {
    const files = Array.from($('photoInput').files || []);
    if (!files.length) {
        setStatus('uploadStatus', 'Choose one or more photos first.');
        return;
    }
    const caption = $('photoCaptionInput').value.trim();
    const album = $('photoAlbumInput').value.trim() || (['all', 'fav'].includes(albumFilter) ? 'Everyday' : albumFilter);
    $('uploadBtn').disabled = true;
    let added = 0;
    let failed = 0;
    for (const [i, file] of files.entries()) {
        setStatus('uploadStatus', `Uploading ${i + 1} of ${files.length}…`);
        try {
            const data = await resizeImage(file);
            const takenOn = file.lastModified ? toDateStr(new Date(file.lastModified)) : todayStr();
            await rpc('add_photo', { caption, data, author: me, album, taken_on: takenOn });
            added++;
        } catch (err) {
            failed++;
        }
    }
    setStatus('uploadStatus', `Uploaded ${added} photo${added === 1 ? '' : 's'} 💜` + (failed ? ` (${failed} failed)` : ''));
    if (added) notifyOther(`📸 ${me} added ${added} photo${added === 1 ? '' : 's'}`, caption || `New in ${album}`, './#memories:photos', 'jn-photos');
    $('photoInput').value = '';
    $('photoCaptionInput').value = '';
    $('uploadBtn').disabled = false;
    albumFilter = album;
    await loadPhotos();
    photoIndex = Math.max(0, photos.length - 1);
    renderPhotos();
});

// ================= Timeline =================
async function loadMilestones() {
    try {
        const items = await rpc('get_milestones');
        const box = $('timeline');
        box.innerHTML = '';
        if (!items.length) {
            box.append(el('p', { className: 'empty-note', textContent: 'Add your first milestone: your first date, first trip, first "I love you"… 💕' }));
        }
        let lastYear = null;
        for (const m of items) {
            const year = m.happened_on.slice(0, 4);
            if (year !== lastYear) {
                box.append(el('div', { className: 'year', textContent: year }));
                lastYear = year;
            }
            const del = el('button', { className: 'icon', textContent: '🗑', title: 'Delete' });
            del.addEventListener('click', async () => {
                if (!confirm('Delete this milestone?')) return;
                await rpc('delete_milestone', { milestone_id: m.id }).catch(() => {});
                loadMilestones();
            });
            const img = m.photo_id ? photoImg(m.photo_id, { alt: m.title }) : null;
            if (img) img.addEventListener('click', () => openViewer(img.src, m.title));
            box.append(el('div', { className: 'tl-item' }, [
                del,
                el('div', { className: 'd', textContent: formatDate(m.happened_on) }),
                el('div', { className: 't', textContent: m.title }),
                m.story ? el('div', { className: 's', textContent: m.story }) : null,
                img,
            ]));
        }
        setStatus('msStatus', '');
        return items;
    } catch (err) {
        setStatus('msStatus', "Couldn't load the timeline.");
        return [];
    }
}
loaders.timeline = loadMilestones;

$('milestoneForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    if (btn) btn.disabled = true;
    try {
        let photoId = null;
        const file = $('msPhoto').files[0];
        if (file) {
            setStatus('msStatus', 'Uploading photo…');
            photoId = await rpc('add_photo', {
                caption: $('msTitle').value.trim(),
                data: await resizeImage(file),
                author: me,
                album: 'Timeline',
                taken_on: $('msDate').value,
            });
        }
        const title = $('msTitle').value.trim();
        await rpc('add_milestone', {
            title,
            happened_on: $('msDate').value,
            story: $('msStory').value,
            photo_id: photoId,
            author: me,
        });
        $('milestoneForm').reset();
        setStatus('msStatus', 'Added to our timeline 💜');
        notifyOther(`🌟 ${me} added to our timeline`, title, './#memories:timeline', 'jn-timeline');
        loadMilestones();
    } catch (err) {
        setStatus('msStatus', "Couldn't add that. Try again.");
    } finally {
        if (btn) btn.disabled = false;
    }
});

// ================= Chat =================
let messages = [];
let seenId = 0;
let openReactFor = null;
let pendingChatPhoto = null;
const chatLog = $('chatLog');

function scrollChatToBottom() { chatLog.scrollTop = chatLog.scrollHeight; }

function reactionSummary(m) {
    return [m.react_jes, m.react_nica].filter(Boolean).join('');
}

function messageBubble(m, { compact = false } = {}) {
    const parts = [];
    if (m.photo_id) {
        const img = photoImg(m.photo_id, { alt: 'Photo' });
        img.addEventListener('click', (e) => { e.stopPropagation(); openViewer(img.src); });
        parts.push(img);
    }
    if (m.body) parts.push(m.body);
    const meta = el('div', { className: 'meta' }, [`${m.author} · ${formatTime(m.created_at)}`]);
    if (!compact && m.author === me) {
        const del = el('button', { className: 'icon', textContent: '✕', title: 'Delete message' });
        del.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm('Delete this message?')) return;
            try {
                await rpc('delete_message', { msg_id: m.id });
                await loadChat();
            } catch (err) {
                setStatus('chatStatus', "Couldn't delete that message.");
            }
        });
        meta.append(del);
    }
    parts.push(meta);
    const summary = reactionSummary(m);
    if (summary) parts.push(el('span', { className: 'reacts', textContent: summary }));
    if (!compact && openReactFor === m.id) {
        const mine = me === 'Jes' ? m.react_jes : m.react_nica;
        const bar = el('div', { className: 'react-bar' });
        for (const emoji of REACTIONS) {
            const b = el('button', { textContent: emoji, className: emoji === mine ? 'mine' : '' });
            b.addEventListener('click', async (e) => {
                e.stopPropagation();
                openReactFor = null;
                const value = emoji === mine ? '' : emoji;
                if (me === 'Jes') m.react_jes = value || null; else m.react_nica = value || null;
                renderChat();
                await rpc('react_message', { msg_id: m.id, who: me, emoji: value }).catch(() => {});
                if (value && m.author !== me) notifyOther(`${value} ${me} reacted`, m.body || 'to your photo', './#us:chat', 'jn-chat');
            });
            bar.append(b);
        }
        parts.push(bar);
    }
    const bubble = el('div', { className: `msg ${m.author}` }, parts);
    if (summary) bubble.style.marginBottom = '8px';
    if (!compact) {
        bubble.addEventListener('click', () => {
            openReactFor = openReactFor === m.id ? null : m.id;
            renderChat();
        });
    }
    return bubble;
}

function renderChat() {
    const nearBottom = chatLog.scrollHeight - chatLog.scrollTop - chatLog.clientHeight < 80;
    chatLog.innerHTML = '';
    if (!messages.length) {
        chatLog.append(el('p', { className: 'empty-note', textContent: 'No updates yet. Tell each other about your day! 💕' }));
    }
    for (const m of messages) chatLog.append(messageBubble(m));
    if (nearBottom) scrollChatToBottom();
    renderLatest();
}

function renderLatest() {
    const box = $('latestUpdate');
    box.innerHTML = '';
    const last = messages[messages.length - 1];
    if (!last) {
        box.append(el('p', { className: 'empty-note', textContent: 'No updates yet.' }));
        return;
    }
    const bubble = messageBubble(last, { compact: true });
    bubble.style.maxWidth = '100%';
    bubble.style.textAlign = 'left';
    box.append(bubble);
}

function markChatSeen() {
    if (!messages.length) return;
    const maxId = messages[messages.length - 1].id;
    if (maxId > seenId) {
        seenId = maxId;
        store.set(`jn_seen_${me}`, String(seenId));
    }
    updateBadges();
}

function updateBadges() {
    const unread = messages.filter((m) => m.author !== me && m.id > seenId).length;
    for (const id of ['usBadge', 'chatBadge']) {
        $(id).hidden = unread === 0;
        $(id).textContent = unread;
    }
    if ('setAppBadge' in navigator) {
        (unread ? navigator.setAppBadge(unread) : navigator.clearAppBadge()).catch(() => {});
    }
}

let lastChatSignature = '';
async function loadChat() {
    try {
        const fresh = await rpc('get_messages');
        const signature = JSON.stringify(fresh.map((m) => [m.id, m.react_jes, m.react_nica]));
        messages = fresh;
        if (signature !== lastChatSignature || !chatLog.querySelector('.msg')) {
            lastChatSignature = signature;
            renderChat();
        }
        if (isPanelOpen('us', 'chat') && document.visibilityState === 'visible') markChatSeen();
        else updateBadges();
        setStatus('chatStatus', '');
    } catch (err) {
        setStatus('chatStatus', "Couldn't load messages.");
    }
}
loaders.chat = () => loadChat().then(() => { scrollChatToBottom(); markChatSeen(); });

$('chatPhoto').addEventListener('change', async () => {
    const file = $('chatPhoto').files[0];
    if (!file) return;
    try {
        pendingChatPhoto = await resizeImage(file);
        $('chatAttachImg').src = pendingChatPhoto;
        $('chatAttachPreview').hidden = false;
    } catch (err) {
        setStatus('chatStatus', "Couldn't read that photo.");
    }
    $('chatPhoto').value = '';
});
$('chatAttachClear').addEventListener('click', () => {
    pendingChatPhoto = null;
    $('chatAttachPreview').hidden = true;
});

$('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = $('chatInput').value.trim();
    if (!body && !pendingChatPhoto) return;
    $('chatSend').disabled = true;
    try {
        let photoId = null;
        if (pendingChatPhoto) {
            setStatus('chatStatus', 'Sending photo…');
            photoId = await rpc('add_photo', { caption: body, data: pendingChatPhoto, author: me, album: 'Chat', taken_on: todayStr() });
        }
        await rpc('add_message', { author: me, body, photo_id: photoId });
        notifyOther(`💬 ${me}`, body || '📷 Sent a photo', './#us:chat', 'jn-chat');
        $('chatInput').value = '';
        pendingChatPhoto = null;
        $('chatAttachPreview').hidden = true;
        await loadChat();
        scrollChatToBottom();
        markChatSeen();
    } catch (err) {
        setStatus('chatStatus', "Couldn't send. Try again.");
    } finally {
        $('chatSend').disabled = false;
    }
});
$('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $('chatForm').requestSubmit();
    }
});

// Check for new messages while the page is open (slower when in the background).
let lastPoll = 0;
setInterval(() => {
    if (site.hidden) return;
    const interval = document.visibilityState === 'visible' ? 8000 : 30000;
    if (Date.now() - lastPoll < interval) return;
    lastPoll = Date.now();
    loadChat();
}, 2000);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !site.hidden) loadChat();
});

// ================= Notifications =================
// Real push notifications: each device subscribes once, and whenever one of us adds
// something, the "notify" server function pushes a notification to the other person's devices.
const VAPID_PUBLIC_KEY = 'BMcJWvXqpxCKBybhyyLHhTX4CIDx9AbmWyy2-48EoM1UPeROOhrgX1KyMZS3Ru7dWSLsYwynDfc0PSMfoAY_IGY';
const NOTIFY_URL = `${SUPABASE_URL}/functions/v1/notify`;
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext;

function urlBase64ToUint8Array(base64) {
    const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function currentPushSub() {
    if (!pushSupported()) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
}

// Tell the other person's devices that something happened. Never blocks or breaks the action itself.
function notifyOther(title, body, url = './', tag = 'jn-update') {
    fetch(NOTIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: passcode, from: me, title, body: String(body || '').slice(0, 300), url, tag }),
        keepalive: true,
    }).catch(() => {});
}

// Re-save this device's subscription under the current name (after switching user or on each visit).
async function syncPushSub() {
    try {
        const sub = await currentPushSub();
        if (sub) await rpc('save_push_sub', { person: me, sub: sub.toJSON() });
    } catch (err) {}
}

async function renderNotifyState() {
    const btn = $('notifyBtn');
    if (!pushSupported()) {
        btn.hidden = true;
        setStatus('notifyStatus', isIOS() && !isStandalone()
            ? 'On iPhone, install the app first (see below), then open it from your home screen and turn notifications on there.'
            : "This browser doesn't support notifications.");
        return;
    }
    btn.hidden = false;
    const sub = await currentPushSub().catch(() => null);
    btn.textContent = sub ? 'Turn off notifications' : 'Turn on notifications';
    setStatus('notifyStatus', Notification.permission === 'denied'
        ? 'Notifications are blocked in your phone/browser settings for this site.'
        : sub ? `Notifications are on 🔔 You'll hear about everything ${other()} adds.` : '');
}

$('notifyBtn').addEventListener('click', async () => {
    const btn = $('notifyBtn');
    btn.disabled = true;
    try {
        const existing = await currentPushSub();
        if (existing) {
            await rpc('delete_push_sub', { endpoint: existing.endpoint }).catch(() => {});
            await existing.unsubscribe();
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
                await rpc('save_push_sub', { person: me, sub: sub.toJSON() });
            }
        }
    } catch (err) {
        setStatus('notifyStatus', "Couldn't change notifications. Try again.");
        btn.disabled = false;
        return;
    }
    btn.disabled = false;
    renderNotifyState();
});

// Open the right page when a notification is tapped (links look like "./#us:chat").
function openFromHash(hash = location.hash) {
    const m = /^#(home|memories|us|plans|settings)(?::(\w+))?$/.exec(hash || '');
    if (!m) return false;
    if (m[2]) currentPanel[m[1]] = m[2];
    showSection(m[1]);
    window.scrollTo(0, 0);
    history.replaceState(null, '', location.pathname);
    return true;
}
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'open' && !site.hidden) openFromHash(new URL(event.data.url).hash);
    });
}
window.addEventListener('hashchange', () => { if (!site.hidden) openFromHash(); });

// ================= Daily question =================
let partnerAnsweredToday = false;
async function loadDaily() {
    const d = todayStr();
    const question = DAILY_QUESTIONS[dailyIndex(d)];
    $('dailyQuestion').textContent = question;
    $('homeQuestion').textContent = question;
    try {
        const rows = await rpc('get_daily', { viewer: me, d });
        const mine = rows.find((r) => r.author === me);
        const theirs = rows.find((r) => r.author !== me);
        partnerAnsweredToday = !!theirs;
        if (mine && document.activeElement !== $('dailyAnswer')) $('dailyAnswer').value = mine.answer || '';
        const box = $('dailyPartner');
        box.innerHTML = '';
        if (theirs && theirs.answer != null) {
            box.append(el('div', { className: 'section-label', textContent: `${other()}'s answer` }));
            box.append(el('div', { className: `msg ${other()}`, style: 'max-width:100%;text-align:left;cursor:default' }, [theirs.answer]));
        } else if (theirs) {
            box.append(el('p', { textContent: `${other()} has answered! Answer too to see what they said 👀` }));
        } else {
            box.append(el('p', { className: 'small', textContent: `Waiting for ${other()} to answer…` }));
        }
        setStatus('dailyStatus', '');
    } catch (err) {
        setStatus('dailyStatus', "Couldn't load today's answers.");
    }
    loadDailyHistory();
}
loaders.daily = loadDaily;

async function loadDailyHistory() {
    try {
        const rows = await rpc('get_daily_history');
        const box = $('dailyHistory');
        box.innerHTML = '';
        const past = rows.filter((r) => r.q_date !== todayStr());
        if (!past.length) {
            box.append(el('p', { className: 'empty-note', textContent: 'Answers you both give will be saved here.' }));
            return;
        }
        for (const r of past) {
            box.append(el('div', { className: 'quiz-q' }, [
                el('div', { className: 'small', textContent: formatDate(r.q_date) }),
                el('div', { className: 'q', textContent: DAILY_QUESTIONS[dailyIndex(r.q_date)] }),
                el('div', { className: 'msg Jes', style: 'max-width:100%;cursor:default;margin-bottom:6px' }, [`Jes: ${r.jes_answer}`]),
                el('div', { className: 'msg Nica', style: 'max-width:100%;cursor:default' }, [`Nica: ${r.nica_answer}`]),
            ]));
        }
    } catch (err) {}
}

$('dailyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const answer = $('dailyAnswer').value.trim();
    if (!answer) return;
    try {
        await rpc('answer_daily', { d: todayStr(), author: me, answer });
        notifyOther(`❓ ${me} answered today's question`,
            partnerAnsweredToday ? "You've both answered. Come see each other's answers 💕" : 'Answer too to see what they said 👀',
            './#us:daily', 'jn-daily');
        setStatus('dailyStatus', 'Saved 💜');
        $('dailyAnswer').blur();
        loadDaily();
    } catch (err) {
        setStatus('dailyStatus', "Couldn't save. Try again.");
    }
});

// ================= Calendar grid (shared by mood + plans) =================
function renderMonthGrid(container, year, month, renderDay, onSelect, selected) {
    container.innerHTML = '';
    for (const dow of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
        container.append(el('div', { className: 'dow', textContent: dow }));
    }
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < first.getDay(); i++) container.append(el('div', { className: 'day blank' }));
    const today = todayStr();
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
        const cell = el('div', {
            className: `day${dateStr === today ? ' today' : ''}${dateStr === selected ? ' selected' : ''}`,
        }, [el('div', { textContent: d })]);
        renderDay(cell, dateStr);
        if (onSelect) cell.addEventListener('click', () => onSelect(dateStr));
        container.append(cell);
    }
}
function monthTitle(year, month) {
    return new Date(year, month, 1).toLocaleDateString([], { month: 'long', year: 'numeric' });
}

// ================= Mood =================
let moods = [];
let moodMonth = new Date().getMonth();
let moodYear = new Date().getFullYear();

function renderMoodPicker() {
    const mine = moods.find((m) => m.mood_date === todayStr() && m.author === me);
    const picker = $('moodPicker');
    picker.innerHTML = '';
    for (const emoji of MOODS) {
        const b = el('button', { textContent: emoji, className: mine && mine.emoji === emoji ? 'active' : '' });
        b.addEventListener('click', () => saveMood(emoji));
        picker.append(b);
    }
    if (mine && document.activeElement !== $('moodNote')) $('moodNote').value = mine.note || '';
}

async function saveMood(emoji) {
    const hadMood = moods.some((m) => m.mood_date === todayStr() && m.author === me);
    try {
        await rpc('set_mood', { d: todayStr(), author: me, emoji, note: $('moodNote').value });
        if (!hadMood) notifyOther(`${emoji} ${me} is feeling ${emoji} today`, $('moodNote').value || 'Check in on them 💕', './#us:mood', 'jn-mood');
        setStatus('moodStatus', `Saved ${emoji}`);
        loadMoods();
    } catch (err) {
        setStatus('moodStatus', "Couldn't save. Try again.");
    }
}
$('moodNote').addEventListener('change', () => {
    const mine = moods.find((m) => m.mood_date === todayStr() && m.author === me);
    if (mine) saveMood(mine.emoji);
});

function renderMoodCalendar() {
    $('moodMonth').textContent = monthTitle(moodYear, moodMonth);
    renderMonthGrid($('moodCalendar'), moodYear, moodMonth, (cell, dateStr) => {
        const jes = moods.find((m) => m.mood_date === dateStr && m.author === 'Jes');
        const nica = moods.find((m) => m.mood_date === dateStr && m.author === 'Nica');
        if (jes || nica) {
            cell.append(el('div', { className: 'moods' }, [
                el('span', { textContent: jes ? jes.emoji : '' }),
                el('span', { textContent: nica ? nica.emoji : '' }),
            ]));
            const notes = [jes && jes.note && `Jes: ${jes.note}`, nica && nica.note && `Nica: ${nica.note}`].filter(Boolean);
            if (notes.length) cell.title = notes.join('\n');
        }
    }, (dateStr) => {
        const notes = moods.filter((m) => m.mood_date === dateStr)
            .map((m) => `${m.author}: ${m.emoji}${m.note ? ` – ${m.note}` : ''}`);
        setStatus('moodStatus', notes.length ? `${formatDate(dateStr)} · ${notes.join(' · ')}` : '');
    });
}
$('moodPrev').addEventListener('click', () => {
    moodMonth--; if (moodMonth < 0) { moodMonth = 11; moodYear--; }
    renderMoodCalendar();
});
$('moodNext').addEventListener('click', () => {
    moodMonth++; if (moodMonth > 11) { moodMonth = 0; moodYear++; }
    renderMoodCalendar();
});

async function loadMoods() {
    try {
        const since = new Date();
        since.setMonth(since.getMonth() - 13);
        moods = await rpc('get_moods', { since: toDateStr(since) });
        renderMoodPicker();
        renderMoodCalendar();
    } catch (err) {
        setStatus('moodStatus', "Couldn't load moods.");
    }
}
loaders.mood = loadMoods;

// ================= Letters =================
function openLetterModal(letter) {
    $('letterModalTitle').textContent = letter.title;
    $('letterModalBody').textContent = letter.body;
    $('letterModalFrom').textContent = `With love, ${letter.written_by} 💌 · ${formatTime(letter.created_at)}`;
    $('letterModal').hidden = false;
}
$('closeLetter').addEventListener('click', () => { $('letterModal').hidden = true; });
$('letterModal').addEventListener('click', (e) => { if (e.target === $('letterModal')) $('letterModal').hidden = true; });

async function loadLetters() {
    const presets = $('letterPresets');
    if (!presets.childElementCount) {
        for (const preset of LETTER_PRESETS) {
            const b = el('button', { textContent: preset, type: 'button' });
            b.addEventListener('click', () => {
                $('letterTitle').value = preset;
                if (preset === 'Open on our anniversary') $('letterUnlock').value = toDateStr(anniversaryInfo().date);
                $('letterBody').focus();
            });
            presets.append(b);
        }
    }
    try {
        const letters = await rpc('get_letters', { viewer: me, today: todayStr() });
        const inbox = $('lettersInbox');
        inbox.innerHTML = '';
        const forMe = letters.filter((l) => l.written_for === me);
        if (!forMe.length) {
            inbox.append(el('p', { className: 'empty-note', textContent: `No letters yet. Ask ${other()} to write you one 💌` }));
        }
        for (const l of forMe) {
            const sub = l.locked
                ? `🔒 Unlocks on ${formatDate(l.unlock_on)}`
                : l.opened_at ? `Opened ${formatTime(l.opened_at)}` : '✨ New! Tap to open';
            const item = el('div', { className: `letter${l.locked ? ' locked' : ''}${!l.locked && !l.opened_at ? ' new' : ''}` }, [
                el('span', { className: 'env', textContent: l.locked ? '🔒' : l.opened_at ? '💌' : '✉️' }),
                el('div', {}, [
                    el('div', { className: 't', textContent: l.title }),
                    el('div', { className: 'small', textContent: `From ${l.written_by} · ${sub}` }),
                ]),
            ]);
            if (!l.locked) {
                item.addEventListener('click', async () => {
                    openLetterModal(l);
                    if (!l.opened_at) {
                        await rpc('open_letter', { letter_id: l.id, viewer: me, today: todayStr() }).catch(() => {});
                        loadLetters();
                    }
                });
            }
            inbox.append(item);
        }

        const sent = $('lettersSent');
        sent.innerHTML = '';
        const byMe = letters.filter((l) => l.written_by === me);
        if (!byMe.length) sent.append(el('p', { className: 'small', textContent: "You haven't written any yet." }));
        for (const l of byMe) {
            const status = l.opened_at ? `✅ Opened ${formatTime(l.opened_at)}` : l.locked ? `🔒 Locked until ${formatDate(l.unlock_on)}` : 'Not opened yet';
            const li = checklistItem({
                title: l.title,
                sub: status,
                onDelete: async () => {
                    if (!confirm('Delete this letter?')) return;
                    await rpc('delete_letter', { letter_id: l.id, viewer: me }).catch(() => {});
                    loadLetters();
                },
            });
            li.querySelector('.body').style.cursor = 'pointer';
            li.querySelector('.body').addEventListener('click', () => openLetterModal(l));
            sent.append(li);
        }
        setStatus('letterStatus', '');
    } catch (err) {
        setStatus('letterStatus', "Couldn't load letters.");
    }
}
loaders.letters = loadLetters;

$('letterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const unlockOn = $('letterUnlock').value || null;
        await rpc('add_letter', {
            title: $('letterTitle').value.trim(),
            body: $('letterBody').value.trim(),
            unlock_on: unlockOn,
            written_by: me,
            written_for: other(),
        });
        notifyOther(`💌 ${me} wrote you a letter`, unlockOn ? `"${$('letterTitle').value.trim()}" 🔒 unlocks ${formatDate(unlockOn)}` : `"${$('letterTitle').value.trim()}"`, './#us:letters', 'jn-letters');
        $('letterForm').reset();
        setStatus('letterStatus', `Sealed and sent to ${other()} 💌`);
        loadLetters();
    } catch (err) {
        setStatus('letterStatus', "Couldn't send. Try again.");
    }
});

// ================= Reasons jar =================
let reasons = [];
async function loadReasons() {
    try {
        reasons = await rpc('get_reasons');
        $('reasonCount').textContent = `All reasons (${reasons.length})`;
        const list = $('reasonList');
        list.innerHTML = '';
        for (const r of reasons) {
            list.append(checklistItem({
                title: r.text,
                sub: r.author ? `from ${r.author}` : '',
                onDelete: async () => {
                    if (!confirm('Remove this reason?')) return;
                    await rpc('delete_reason', { reason_id: r.id }).catch(() => {});
                    loadReasons();
                },
            }));
        }
        setStatus('reasonStatus', '');
    } catch (err) {
        setStatus('reasonStatus', "Couldn't load the jar.");
    }
}
loaders.reasons = loadReasons;

let lastReasonId = null;
$('pullReason').addEventListener('click', () => {
    shake($('pullReason'));
    const card = $('reasonCard');
    // Prefer reasons written by the other person, so you read what they love about you.
    const pool = reasons.filter((r) => r.author !== me).length ? reasons.filter((r) => r.author !== me) : reasons;
    if (!pool.length) {
        card.textContent = 'The jar is empty! Add some reasons below 💕';
    } else {
        let pick = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && pick.id === lastReasonId) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
        lastReasonId = pick.id;
        card.textContent = `💗 ${pick.text}${pick.author ? ` — ${pick.author}` : ''}`;
    }
    card.hidden = false;
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
});

$('reasonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = $('reasonInput').value.trim();
    if (!text) return;
    try {
        await rpc('add_reason', { reason: text, author: me });
        notifyOther(`🫙 ${me} added a reason to the jar`, 'Tap the jar to find out why they love you 💗', './#us:reasons', 'jn-reasons');
        $('reasonInput').value = '';
        setStatus('reasonStatus', 'Added to the jar 🫙');
        loadReasons();
    } catch (err) {
        setStatus('reasonStatus', "Couldn't add that. Try again.");
    }
});

// ================= Quiz =================
async function loadQuiz() {
    $('quizTitle').textContent = `🧠 How well do you know ${other()}?`;
    try {
        const items = await rpc('get_quiz', { viewer: me });
        const theirs = items.filter((q) => q.author !== me);
        const mine = items.filter((q) => q.author === me);

        const answered = theirs.filter((q) => q.my_guess != null);
        const right = answered.filter((q) => q.my_correct).length;
        $('quizScore').textContent = theirs.length
            ? `Your score: ${right} / ${answered.length}` + (answered.length < theirs.length ? ` · ${theirs.length - answered.length} to go` : '')
            : '';

        const box = $('quizToAnswer');
        box.innerHTML = '';
        if (!theirs.length) {
            box.append(el('p', { className: 'empty-note', textContent: `${other()} hasn't written any questions yet.` }));
        }
        // Unanswered first
        for (const q of [...theirs.filter((x) => x.my_guess == null), ...answered]) {
            const opts = el('div', { className: 'opts' });
            for (const option of q.options) {
                const b = el('button', { textContent: option });
                if (q.my_guess != null) {
                    b.disabled = true;
                    if (option === q.answer) b.classList.add('right');
                    else if (option === q.my_guess) b.classList.add('wrong');
                } else {
                    b.addEventListener('click', async () => {
                        const correct = await rpc('answer_quiz', { quiz_id: q.id, guesser: me, guess: option }).catch(() => null);
                        if (correct !== null) notifyOther(`🧠 ${me} answered your question ${correct ? '✅' : '❌'}`, q.question, './#us:quiz', 'jn-quiz');
                        loadQuiz();
                    });
                }
                opts.append(b);
            }
            const result = q.my_guess == null ? null
                : el('div', { className: 'small', style: 'margin-top:6px', textContent: q.my_correct ? '✅ Correct!' : `❌ The answer was: ${q.answer}` });
            box.append(el('div', { className: 'quiz-q' }, [el('div', { className: 'q', textContent: q.question }), opts, result]));
        }

        const list = $('quizMine');
        list.innerHTML = '';
        for (const q of mine) {
            const status = q.their_guess == null
                ? `${other()} hasn't answered yet`
                : q.their_correct ? `✅ ${other()} got it right!` : `❌ ${other()} guessed "${q.their_guess}"`;
            list.append(checklistItem({
                title: q.question,
                sub: `Answer: ${q.answer}\n${status}`,
                onDelete: async () => {
                    if (!confirm('Delete this question?')) return;
                    await rpc('delete_quiz', { quiz_id: q.id, viewer: me }).catch(() => {});
                    loadQuiz();
                },
            }));
        }
        setStatus('quizStatus', '');
    } catch (err) {
        setStatus('quizStatus', "Couldn't load the quiz.");
    }
}
loaders.quiz = loadQuiz;

$('quizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const decoys = [...document.querySelectorAll('.quiz-decoy')].map((i) => i.value.trim()).filter(Boolean);
    if (!decoys.length) {
        setStatus('quizStatus', 'Add at least one wrong answer so it is multiple choice.');
        return;
    }
    try {
        await rpc('add_quiz', { author: me, question: $('quizQuestion').value.trim(), answer: $('quizAnswer').value.trim(), decoys });
        notifyOther(`🧠 ${me} wrote a quiz question`, $('quizQuestion').value.trim(), './#us:quiz', 'jn-quiz');
        $('quizForm').reset();
        setStatus('quizStatus', 'Question added 🧠');
        loadQuiz();
    } catch (err) {
        setStatus('quizStatus', "Couldn't add that. Try again.");
    }
});

// ================= To-Do =================
async function loadTodos() {
    try {
        const todos = await rpc('get_todos');
        const list = $('todoList');
        list.innerHTML = '';
        if (!todos.length) list.append(el('p', { className: 'empty-note', textContent: 'Nothing to do yet ✨' }));
        for (const t of todos) {
            list.append(checklistItem({
                done: t.done,
                title: t.text,
                sub: t.created_by ? `added by ${t.created_by}` : '',
                onToggle: async (done) => { await rpc('set_todo_done', { todo_id: t.id, is_done: done }).catch(() => {}); loadTodos(); },
                onDelete: async () => { await rpc('delete_todo', { todo_id: t.id }).catch(() => {}); loadTodos(); },
            }));
        }
        setStatus('todoStatus', '');
    } catch (err) {
        setStatus('todoStatus', "Couldn't load the to-do list.");
    }
}
loaders.todos = loadTodos;

$('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = $('todoInput').value.trim();
    if (!text) return;
    try {
        await rpc('add_todo', { todo_text: text, author: me });
        notifyOther(`✅ ${me} added a to-do`, text, './#plans:todos', 'jn-todos');
        $('todoInput').value = '';
        loadTodos();
    } catch (err) {
        setStatus('todoStatus', "Couldn't add that. Try again.");
    }
});

// ================= Activities =================
let activities = [];
async function loadActivities() {
    try {
        activities = await rpc('get_activities');
        const wrap = $('activityList');
        wrap.innerHTML = '';
        if (!activities.length) {
            wrap.append(el('p', { className: 'empty-note', textContent: 'Add date ideas, trips, and things you want to do together 🎡' }));
        }
        const groups = [
            ['Coming up', activities.filter((a) => !a.done)],
            ['Done together 💜', activities.filter((a) => a.done)],
        ];
        for (const [label, group] of groups) {
            if (!group.length) continue;
            wrap.append(el('div', { className: 'section-label', textContent: label }));
            const ul = el('ul', { className: 'items' });
            for (const a of group) {
                const sub = [
                    a.planned_for && `📅 ${formatDate(a.planned_for)}`,
                    a.notes,
                    a.created_by && `added by ${a.created_by}`,
                ].filter(Boolean).join('\n');
                ul.append(checklistItem({
                    done: a.done,
                    title: a.title,
                    sub,
                    onToggle: async (done) => { await rpc('set_activity_done', { activity_id: a.id, is_done: done }).catch(() => {}); loadActivities(); },
                    onDelete: async () => {
                        if (!confirm('Delete this activity?')) return;
                        await rpc('delete_activity', { activity_id: a.id }).catch(() => {});
                        loadActivities();
                    },
                }));
            }
            wrap.append(ul);
        }
        setStatus('activityStatus', '');
    } catch (err) {
        setStatus('activityStatus', "Couldn't load activities.");
    }
}
loaders.activities = loadActivities;

$('activityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('activityTitle').value.trim();
    if (!title) return;
    try {
        const plannedFor = $('activityDate').value || null;
        await rpc('add_activity', {
            title,
            notes: $('activityNotes').value.trim(),
            planned_for: plannedFor,
            author: me,
        });
        notifyOther(`🎡 ${me} added an activity`, plannedFor ? `${title} · ${formatDate(plannedFor)}` : title, './#plans:activities', 'jn-activities');
        $('activityForm').reset();
        loadActivities();
    } catch (err) {
        setStatus('activityStatus', "Couldn't add that. Try again.");
    }
});

// ================= Countdowns =================
let countdowns = [];

function upcomingCountdowns() {
    const today = startOfToday();
    const ann = anniversaryInfo();
    const list = [{ emoji: '💜', title: `Our ${ann.years}-year anniversary`, days: ann.days, date: ann.date, builtIn: true }];
    for (const c of countdowns) {
        const next = nextOccurrence(c.target_date, c.yearly);
        list.push({ ...c, emoji: c.emoji || '⏳', days: daysBetween(today, next), date: next });
    }
    return list.sort((a, b) => {
        // Upcoming first (soonest first), then past ones (most recent first).
        if ((a.days >= 0) !== (b.days >= 0)) return a.days >= 0 ? -1 : 1;
        return a.days >= 0 ? a.days - b.days : b.days - a.days;
    });
}

function countdownRow(c, withDelete) {
    return checklistItem({
        lead: el('span', { className: 'big-emoji', textContent: c.emoji }),
        title: c.title,
        sub: `${c.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}${c.yearly ? ' · every year' : ''}`,
        onDelete: withDelete && !c.builtIn ? async () => {
            if (!confirm('Delete this countdown?')) return;
            await rpc('delete_countdown', { countdown_id: c.id }).catch(() => {});
            loadCountdowns();
        } : null,
    });
}

function renderCountdowns() {
    const all = upcomingCountdowns();
    const list = $('countdownList');
    list.innerHTML = '';
    for (const c of all) {
        const li = countdownRow(c, true);
        li.insertBefore(el('span', { className: 'days', textContent: daysLabel(c.days) }), li.lastChild.tagName === 'BUTTON' ? li.lastChild : null);
        list.append(li);
    }
    const home = $('homeCountdowns');
    home.innerHTML = '';
    for (const c of all.filter((x) => x.days >= 0).slice(0, 4)) {
        const li = countdownRow(c, false);
        li.append(el('span', { className: 'days', textContent: daysLabel(c.days) }));
        home.append(li);
    }
}

async function loadCountdowns() {
    try {
        countdowns = await rpc('get_countdowns');
        renderCountdowns();
        setStatus('cdStatus', '');
    } catch (err) {
        renderCountdowns();
        setStatus('cdStatus', "Couldn't load countdowns.");
    }
}
loaders.countdowns = loadCountdowns;

$('countdownForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const cdTitle = $('cdTitle').value.trim();
        await rpc('add_countdown', {
            title: cdTitle,
            emoji: $('cdEmoji').value.trim(),
            target_date: $('cdDate').value,
            yearly: $('cdYearly').checked,
            author: me,
        });
        const next = nextOccurrence($('cdDate').value, $('cdYearly').checked);
        notifyOther(`⏳ ${me} added a countdown`, `${$('cdEmoji').value.trim()} ${cdTitle} · ${formatDate(toDateStr(next))}`.trim(), './#plans:countdowns', 'jn-countdowns');
        $('countdownForm').reset();
        loadCountdowns();
    } catch (err) {
        setStatus('cdStatus', "Couldn't add that. Try again.");
    }
});

// ================= Calendar =================
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
let calSelected = todayStr();
let milestones = [];

function eventsOn(dateStr) {
    const d = parseDate(dateStr);
    const md = dateStr.slice(5);
    const events = [];
    if (md === '06-07' && d.getFullYear() >= 2023) {
        const years = d.getFullYear() - 2023;
        events.push({ emoji: '💜', text: years ? `Our ${years}-year anniversary` : 'The day we got together' });
    }
    for (const a of activities) {
        if (a.planned_for === dateStr) events.push({ emoji: a.done ? '✅' : '🎡', text: a.title });
    }
    for (const c of countdowns) {
        const matches = c.yearly ? c.target_date.slice(5) === md && dateStr >= c.target_date : c.target_date === dateStr;
        if (matches) events.push({ emoji: c.emoji || '⏳', text: c.title });
    }
    for (const m of milestones) {
        if (m.happened_on === dateStr) events.push({ emoji: '🌟', text: m.title });
        else if (m.happened_on.slice(5) === md && dateStr > m.happened_on) {
            const years = d.getFullYear() - parseDate(m.happened_on).getFullYear();
            events.push({ emoji: '🌟', text: `${years} year${years === 1 ? '' : 's'} since: ${m.title}` });
        }
    }
    return events;
}

function renderCalendar() {
    $('calMonth').textContent = monthTitle(calYear, calMonth);
    renderMonthGrid($('calendar'), calYear, calMonth, (cell, dateStr) => {
        const events = eventsOn(dateStr);
        if (events.length) cell.append(el('div', { className: 'marks', textContent: events.map((e) => e.emoji).join('') }));
    }, (dateStr) => {
        calSelected = dateStr;
        renderCalendar();
    }, calSelected);

    const box = $('calDay');
    box.innerHTML = '';
    box.append(el('div', { className: 'section-label', textContent: formatDate(calSelected, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }));
    const events = eventsOn(calSelected);
    if (!events.length) box.append(el('p', { className: 'small', textContent: 'Nothing planned. Add an activity or countdown for this day!' }));
    const ul = el('ul', { className: 'items' });
    for (const e of events) ul.append(checklistItem({ lead: el('span', { className: 'big-emoji', textContent: e.emoji }), title: e.text }));
    box.append(ul);
}
$('calPrev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
});
$('calNext').addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
});

async function loadCalendar() {
    renderCalendar();
    try {
        [activities, countdowns, milestones] = await Promise.all([rpc('get_activities'), rpc('get_countdowns'), rpc('get_milestones')]);
    } catch (err) {}
    renderCalendar();
}
loaders.calendar = loadCalendar;

// ================= Map =================
let map = null;
let markerLayer = null;
let places = [];

function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const css = el('link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css' });
        document.head.append(css);
        const script = el('script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js' });
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
    });
}

async function ensureMap() {
    await loadLeaflet();
    if (map) {
        setTimeout(() => map.invalidateSize(), 50);
        return;
    }
    map = L.map('map', { worldCopyJump: true }).setView([20, 0], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    map.on('click', async (e) => {
        const name = prompt('Name this place:');
        if (!name || !name.trim()) return;
        const visited = confirm('Have you been there together already?\n\nOK = Been there 💜\nCancel = Want to go 💗');
        await addPlace(name.trim(), e.latlng.lat, e.latlng.lng, visited);
    });
}

async function addPlace(name, lat, lng, visited) {
    try {
        await rpc('add_place', { name, lat, lng, visited, notes: null, author: me });
        notifyOther(`🗺️ ${me} pinned a place`, `${name} · ${visited ? 'been there 💜' : 'want to go 💗'}`, './#plans:map', 'jn-map');
        $('placeResults').innerHTML = '';
        setStatus('placeStatus', `Added ${name} 📍`);
        loadPlaces();
    } catch (err) {
        setStatus('placeStatus', "Couldn't add that place.");
    }
}

function renderPlaces() {
    if (markerLayer) {
        markerLayer.clearLayers();
        const bounds = [];
        for (const pl of places) {
            const color = pl.visited ? '#8e44ad' : '#ff6fb5';
            L.circleMarker([pl.lat, pl.lng], { radius: 9, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 })
                .bindPopup(`${pl.visited ? '💜 Been there' : '💗 Want to go'}`)
                .bindTooltip(pl.name)
                .addTo(markerLayer);
            bounds.push([pl.lat, pl.lng]);
        }
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
        else if (bounds.length === 1) map.setView(bounds[0], 6);
    }
    const list = $('placeList');
    list.innerHTML = '';
    for (const [label, group] of [['Want to go 💗', places.filter((p) => !p.visited)], ['Been there 💜', places.filter((p) => p.visited)]]) {
        if (!group.length) continue;
        list.append(el('li', { className: 'section-label', textContent: label, style: 'border:none' }));
        for (const pl of group) {
            const li = checklistItem({
                done: false,
                title: pl.name,
                sub: [pl.visited ? 'Been there ✓' : 'Tick when you go', pl.created_by && `added by ${pl.created_by}`].filter(Boolean).join(' · '),
                onToggle: async (on) => { await rpc('set_place_visited', { place_id: pl.id, is_visited: on }).catch(() => {}); loadPlaces(); },
                onDelete: async () => {
                    if (!confirm(`Remove ${pl.name}?`)) return;
                    await rpc('delete_place', { place_id: pl.id }).catch(() => {});
                    loadPlaces();
                },
            });
            li.querySelector('input').checked = pl.visited;
            li.querySelector('.title').style.cursor = 'pointer';
            li.querySelector('.title').addEventListener('click', () => { if (map) map.setView([pl.lat, pl.lng], 10); });
            list.append(li);
        }
    }
}

async function loadPlaces() {
    try {
        await ensureMap();
    } catch (err) {
        setStatus('placeStatus', "Couldn't load the map.");
    }
    try {
        places = await rpc('get_places');
        renderPlaces();
    } catch (err) {
        setStatus('placeStatus', "Couldn't load places.");
    }
}
loaders.map = loadPlaces;

$('placeSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('placeSearch').value.trim();
    if (!q) return;
    const results = $('placeResults');
    results.innerHTML = '';
    setStatus('placeStatus', 'Searching…');
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, {
            headers: { 'Accept-Language': navigator.language || 'en' },
        });
        const found = await res.json();
        setStatus('placeStatus', found.length ? '' : 'No places found.');
        for (const f of found) {
            const shortName = f.display_name.split(',').slice(0, 2).join(',').trim();
            const want = el('button', { className: 'ghost', textContent: '💗 Want', style: 'padding:4px 10px;font-size:0.85em' });
            const been = el('button', { className: 'ghost', textContent: '💜 Been', style: 'padding:4px 10px;font-size:0.85em' });
            want.addEventListener('click', () => addPlace(shortName, Number(f.lat), Number(f.lon), false));
            been.addEventListener('click', () => addPlace(shortName, Number(f.lat), Number(f.lon), true));
            results.append(el('li', {}, [el('div', { className: 'body' }, [
                el('div', { className: 'title', textContent: shortName }),
                el('div', { className: 'sub', textContent: f.display_name }),
            ]), want, been]));
        }
    } catch (err) {
        setStatus('placeStatus', "Search didn't work. Try tapping the map instead.");
    }
});

// ================= Wishlist =================
async function loadWishlist() {
    $('wishTitle').textContent = `🎁 Gift ideas for ${other()}`;
    $('wishNote').textContent = `🤫 ${other()} can't see this list. They have their own secret list of ideas for you.`;
    try {
        const items = await rpc('get_wishlist', { viewer: me });
        const list = $('wishList');
        list.innerHTML = '';
        if (!items.length) list.append(el('p', { className: 'empty-note', textContent: `Jot down things ${other()} mentions wanting 🎁` }));
        for (const w of items) {
            const li = checklistItem({
                done: w.bought,
                title: w.idea,
                sub: [w.bought ? 'Got it ✓' : '', w.added_by ? `added by ${w.added_by}` : ''].filter(Boolean).join(' · '),
                onToggle: async (on) => { await rpc('set_wish_bought', { wish_id: w.id, viewer: me, is_bought: on }).catch(() => {}); loadWishlist(); },
                onDelete: async () => {
                    if (!confirm('Delete this idea?')) return;
                    await rpc('delete_wish', { wish_id: w.id, viewer: me }).catch(() => {});
                    loadWishlist();
                },
            });
            if (w.link && /^https?:\/\//i.test(w.link)) {
                li.querySelector('.body').append(el('a', { href: w.link, target: '_blank', rel: 'noopener', textContent: '🔗 Link', className: 'small' }));
            }
            list.append(li);
        }
        setStatus('wishStatus', '');
    } catch (err) {
        setStatus('wishStatus', "Couldn't load the wishlist.");
    }
}
loaders.wishlist = loadWishlist;

$('wishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await rpc('add_wish', { for_person: other(), idea: $('wishIdea').value.trim(), link: $('wishLink').value.trim(), author: me });
        $('wishForm').reset();
        loadWishlist();
    } catch (err) {
        setStatus('wishStatus', "Couldn't add that. Try again.");
    }
});

// ================= Our song =================
let songUrl = '';
let ytPlayer = null;
let ytApi = null;

function youTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
    return m ? m[1] : null;
}

function loadYouTubeApi() {
    if (!ytApi) {
        ytApi = new Promise((resolve, reject) => {
            if (window.YT && window.YT.Player) return resolve();
            window.onYouTubeIframeAPIReady = resolve;
            const script = el('script', { src: 'https://www.youtube.com/iframe_api' });
            script.onerror = () => { ytApi = null; reject(new Error('YouTube unavailable')); };
            document.head.append(script);
        });
    }
    return ytApi;
}

function setMusicIcon(playing) {
    $('musicBtn').classList.toggle('playing', playing);
    $('musicBtn').textContent = playing ? '🎶' : '🎵';
}

function stopMusic() {
    if (ytPlayer) { try { ytPlayer.destroy(); } catch (err) {} ytPlayer = null; }
    $('musicFrame').replaceWith(el('div', { id: 'musicFrame' }));
    $('musicPlayer').hidden = true;
    $('musicPlayer').classList.remove('minimized');
    setMusicIcon(false);
}

async function openMusic() {
    const panel = $('musicPlayer');
    // Already loaded: just show/hide the card without interrupting the song.
    if (!panel.hidden && (ytPlayer || panel.querySelector('audio'))) {
        panel.classList.toggle('minimized');
        return;
    }
    panel.hidden = false;
    panel.classList.remove('minimized');
    $('musicMsg').textContent = 'Loading…';
    const id = youTubeId(songUrl);
    $('musicOpen').hidden = !id;
    if (id) $('musicOpen').href = `https://www.youtube.com/watch?v=${id}`;

    if (!id) {
        const audio = el('audio', { src: songUrl, loop: true, controls: true });
        $('musicFrame').replaceWith(el('div', { id: 'musicFrame' }, [audio]));
        audio.addEventListener('playing', () => { setMusicIcon(true); $('musicMsg').textContent = ''; });
        audio.addEventListener('pause', () => setMusicIcon(false));
        audio.addEventListener('error', () => { $('musicMsg').textContent = "Couldn't play that link. Try a YouTube link instead."; });
        audio.play().catch(() => { $('musicMsg').textContent = 'Tap ▶ to play.'; });
        return;
    }

    try {
        await loadYouTubeApi();
    } catch (err) {
        $('musicMsg').textContent = "Couldn't load YouTube. Use the button below to listen there.";
        return;
    }
    ytPlayer = new YT.Player('musicFrame', {
        videoId: id,
        playerVars: { autoplay: 1, loop: 1, playlist: id, playsinline: 1, rel: 0 },
        events: {
            onReady: (e) => {
                e.target.playVideo();
                // Phones often block sound until you press play yourself.
                setTimeout(() => {
                    if (ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                        $('musicMsg').textContent = 'Tap ▶ on the video to start the song.';
                    }
                }, 1500);
            },
            onStateChange: (e) => {
                const playing = e.data === YT.PlayerState.PLAYING;
                setMusicIcon(playing);
                if (playing) $('musicMsg').textContent = 'Tap ▾ to hide the player. The song keeps playing.';
            },
            onError: (e) => {
                setMusicIcon(false);
                $('musicMsg').textContent = [101, 150, 153].includes(e.data)
                    ? "This video's owner doesn't allow it to play on other websites. Open it in YouTube, or save a different upload of the song (a lyrics or audio version usually works)."
                    : "This video can't be played. Check the link in Settings.";
            },
        },
    });
}

$('musicBtn').addEventListener('click', openMusic);
$('musicMinimize').addEventListener('click', () => $('musicPlayer').classList.add('minimized'));
$('musicClose').addEventListener('click', stopMusic);

function applySong(url) {
    songUrl = (url || '').trim();
    $('musicBtn').hidden = !songUrl;
    if (!songUrl) stopMusic();
}

async function loadSettings() {
    renderNotifyState();
    renderInstallState();
    try {
        const rows = await rpc('get_settings');
        const song = rows.find((r) => r.key === 'song_url');
        applySong(song ? song.value : '');
        if (document.activeElement !== $('songUrl')) $('songUrl').value = songUrl;
    } catch (err) {}
}

$('songForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = $('songUrl').value.trim();
    if (url && !/^https?:\/\//i.test(url)) {
        setStatus('songStatus', 'Paste a full link starting with https://');
        return;
    }
    try {
        await rpc('set_setting', { setting_key: 'song_url', setting_value: url });
        stopMusic();
        applySong(url);
        setStatus('songStatus', url ? 'Saved! Tap the 🎵 button to play 💜' : 'Song removed.');
        if (url) notifyOther(`🎵 ${me} set our song`, 'Tap the 🎵 button to listen', './#settings', 'jn-song');
    } catch (err) {
        setStatus('songStatus', "Couldn't save. Try again.");
    }
});

// ================= Install as app =================
let installPrompt = null;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    renderInstallState();
});
window.addEventListener('appinstalled', () => {
    installPrompt = null;
    renderInstallState();
});

function renderInstallState() {
    const info = $('installInfo');
    $('installBtn').hidden = !installPrompt;
    if (isStandalone()) {
        info.textContent = "You're using the app version ✓";
    } else if (installPrompt) {
        info.textContent = 'Add Jes & Nica to your home screen so it opens like a real app.';
    } else if (isIOS()) {
        info.textContent = 'On iPhone: open this site in Safari, tap the Share button (□↑), then "Add to Home Screen".';
    } else {
        info.textContent = 'In Chrome: open the ⋮ menu and choose "Install app" or "Add to Home screen".';
    }
}
$('installBtn').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    installPrompt = null;
    renderInstallState();
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ================= Dark mode =================
if (store.get('jn_dark') === '1') document.body.classList.add('dark-mode');
$('darkModeToggle').addEventListener('click', () => {
    const on = document.body.classList.toggle('dark-mode');
    store.set('jn_dark', on ? '1' : '0');
});

// ================= Start =================
// If this device already unlocked before, check the saved passcode and skip the gate.
if (passcode) {
    rpc('verify_passcode')
        .then((ok) => {
            if (ok) {
                afterPasscode();
            } else {
                passcode = '';
                store.remove('jn_passcode');
            }
        })
        .catch(() => {});
}
