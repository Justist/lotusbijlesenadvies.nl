// Flat list of all pages (routing target = file to load)
const PAGES = [
   { id: 'home',               label: 'Home',                                 file: 'content/home.html' },
   { id: 'basisschool',        label: 'Basisschool',                          file: 'content/basisschool.html' },
   { id: 'voortgezet-mbo-hbo', label: 'Voortgezet onderwijs / MBO / HBO',      file: 'content/voortgezet-mbo-hbo.html' },
   { id: 'nt2-inburgering',    label: 'NT2 & Inburgering',                    file: 'content/nt2-inburgering.html' },
   { id: 'werkwijze',          label: 'Mijn werkwijze',                       file: 'content/werkwijze.html' },
   { id: 'over-mij',           label: 'Over mij',                             file: 'content/over-mij.html' },
   { id: 'reviews',            label: 'Reviews',                              file: 'content/reviews.html' },
   { id: 'tarieven',           label: 'Tarieven',                             file: 'content/tarieven.html' },
   { id: 'aanmelden',          label: 'Aanmelden voor begeleiding',           file: 'content/aanmelden.html' }
];

// Nav structure: either a direct link or a dropdown group with children (by id)
const NAV_STRUCTURE = [
   {
      type: 'dropdown',
      label: 'Bijles & Leercoaching',
      children: ['basisschool', 'voortgezet-mbo-hbo', 'nt2-inburgering']
   },
   { type: 'link', id: 'werkwijze' },
   { type: 'link', id: 'over-mij' },
   { type: 'link', id: 'reviews' },
   { type: 'link', id: 'tarieven' },
   { type: 'link', id: 'aanmelden' }
];

function getCurrentPageId() {
   const hash = window.location.hash.replace('#', '');
   const exists = PAGES.some(p => p.id === hash);
   return exists ? hash : PAGES[0]?.id;
}

function renderNav() {
   const nav = document.getElementById('nav');
   const currentId = getCurrentPageId();

   nav.innerHTML = NAV_STRUCTURE.map(item => {
      if (item.type === 'dropdown') {
         const isChildActive = item.children.includes(currentId);
         const childLinks = item.children.map(childId => {
            const page = PAGES.find(p => p.id === childId);
            const active = childId === currentId ? 'dropdown-link--active' : '';
            return `<a href="#${childId}" class="dropdown-link ${active}">${page.label}</a>`;
         }).join('');

         return `
        <details class="nav-dropdown ${isChildActive ? 'nav-dropdown--active' : ''}">
          <summary class="nav-link">${item.label}</summary>
          <div class="dropdown-menu">${childLinks}</div>
        </details>
      `;
      }

      const page = PAGES.find(p => p.id === item.id);
      const active = item.id === currentId ? 'nav-link--active' : '';
      return `<a href="#${item.id}" class="nav-link ${active}">${page.label}</a>`;
   }).join('');
}

async function loadPageContent(file) {
   const res = await fetch(file);
   if (!res.ok) {
      console.error(`Kon ${file} niet laden`, res.status);
      return `<p>Pagina kon niet geladen worden.</p>`;
   }
   return await res.text();
}

async function renderPageById(id) {
   const page = PAGES.find(p => p.id === id) || PAGES[0];
   const html = await loadPageContent(page.file);

   document.getElementById('app').innerHTML = `
    <section id="${page.id}" class="page">
      ${html}
    </section>
  `;

   renderNav();
   initTikTokEmbeds();
}

// Load TikTok embed.js only if a TikTok blockquote is present on the page
function initTikTokEmbeds() {
   if (!document.querySelector('.tiktok-embed')) return;
   document.querySelector('script[data-tiktok-embed]')?.remove();

   const script = document.createElement('script');
   script.src = 'https://www.tiktok.com/embed.js';
   script.async = true;
   script.dataset.tiktokEmbed = 'true';
   document.body.appendChild(script);
}

function onHashChange() {
   renderPageById(getCurrentPageId());
}

document.addEventListener('DOMContentLoaded', () => {
   renderNav();
   renderPageById(getCurrentPageId());
   window.addEventListener('hashchange', onHashChange);
});

// Close an open dropdown after clicking one of its links
document.addEventListener('click', e => {
   if (e.target.matches('.dropdown-link')) {
      e.target.closest('details')?.removeAttribute('open');
   }
});
