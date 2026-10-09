import { SITE_CONFIG } from "./site-config.js";

const app = document.querySelector("#app");
const header = document.querySelector(".site-header");
const brand = document.querySelector(".brand");
const nav = document.querySelector("#nav");
const menuButton = document.querySelector(".menu-toggle");
const errorTemplate = document.querySelector("#page-error-template");
const siteTitle = document.title;
let activeRequest;
let renderedRouteId = "";
let layoutFrame;

function createLink(page) {
   const link = document.createElement("a");

   link.className =
      `nav-link${ page.callToAction ? " nav-cta" : "" }`;

   link.href = `#${ page.id }`;
   link.dataset.route = page.id;
   link.dataset.src = `content/${ page.file }`;
   link.textContent = page.label;

   if (page.home) {
      link.dataset.defaultRoute = "";
   }

   return link;
}

function buildNavigation() {
   const items = SITE_CONFIG.navigation;

   const pagesById = new Map(
      items
         .filter(item => item.type !== "dropdown")
         .map(item => [item.id, item])
   );

   const groupedPageIds = new Set(
      items
         .filter(item => item.type === "dropdown")
         .flatMap(item => item.children)
   );

   const fragment = document.createDocumentFragment();

   for (const item of items) {
      if (item.type === "dropdown") {
         const dropdown = document.createElement("details");
         dropdown.className = "nav-dropdown";

         const summary = document.createElement("summary");
         summary.className = "nav-link";
         summary.textContent = item.label;

         const dropdownMenu = document.createElement("div");
         dropdownMenu.className = "dropdown-menu";

         for (const childId of item.children) {
            const page = pagesById.get(childId);

            if (! page) {
               throw new Error(
                  `Unknown dropdown page "${ childId }" in "${ item.label }".`
               );
            }

            dropdownMenu.append(createLink(page));
         }

         dropdown.append(summary, dropdownMenu);
         fragment.append(dropdown);
      } else if (! groupedPageIds.has(item.id)) {
         fragment.append(createLink(item));
      }
   }

   nav.replaceChildren(fragment);
}

function routeLinks() {
   return [...nav.querySelectorAll("[data-route][data-src]")];
}

function locationState() {
   const [routeId = "", ...targetParts] = window.location.hash.slice(1).split("/");
   return {
      routeId,
      targetId : targetParts.length ? decodeURIComponent(targetParts.join("/")) : ""
   };
}

function currentRoute() {
   const { routeId } = locationState();
   return routeLinks().find(link => link.dataset.route === routeId)
          || nav.querySelector("[data-default-route]");
}

function updateNavigation(routeId) {
   routeLinks().forEach(link => {
      const active = link.dataset.route === routeId;

      link.classList.toggle("is-active", active);

      if (active) {
         link.setAttribute("aria-current", "page");
      } else {
         link.removeAttribute("aria-current");
      }
   });

   nav.querySelectorAll(".nav-dropdown").forEach(dropdown => {
      dropdown.classList.toggle(
         "has-active-page",
         Boolean(dropdown.querySelector("[aria-current=\"page\"]"))
      );
   });
}

function closeNavigation() {
   nav.classList.remove("is-open");
   menuButton.setAttribute("aria-expanded", "false");

   nav.querySelectorAll(".nav-dropdown[open]").forEach(dropdown => {
      dropdown.open = false;
   });
}

function updateNavigationLayout() {
   cancelAnimationFrame(layoutFrame);
   layoutFrame = requestAnimationFrame(() => {
      header.classList.remove("nav-is-collapsed");
      closeNavigation();

      const styles = getComputedStyle(header);
      const available = header.clientWidth
                        - parseFloat(styles.paddingLeft)
                        - parseFloat(styles.paddingRight);
      const required = brand.getBoundingClientRect().width
                       + nav.scrollWidth
                       + parseFloat(styles.columnGap || styles.gap || 0);

      header.classList.toggle("nav-is-collapsed", required > available + 1);
   });
}

function slugify(text) {
   return text.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
}

function initPageIndex(routeId) {
   const article = app.querySelector(".page-shell");
   if (! article || article.querySelector(".page-index")) {
      return;
   }

   const sections = [...article.querySelectorAll(":scope > section")]
      .filter(section => section.querySelector(":scope > h2, :scope > .section-heading > h2"));
   if (sections.length < SITE_CONFIG.pageIndexMinimumHeadings) {
      return;
   }

   const articleHeader = article.querySelector(":scope > header");
   const movableContent = [...article.children].filter(child => child !== articleHeader);
   const wrapper = document.createElement("div");
   const content = document.createElement("div");
   const aside = document.createElement("aside");
   const title = document.createElement("h2");
   const indexNav = document.createElement("nav");
   const list = document.createElement("ul");

   wrapper.className = "long-page-layout";
   content.className = "long-page-content";
   aside.className = "sidebar-box page-index";
   title.id = "page-index-title";
   title.textContent = "Snel naar";
   indexNav.setAttribute("aria-labelledby", title.id);
   list.className = "page-index-list";

   sections.forEach((section, index) => {
      const heading = section.querySelector(":scope > h2, :scope > .section-heading > h2");
      if (! heading.id) {
         heading.id = slugify(heading.textContent) || `onderdeel-${ index + 1 }`;
      }
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${ routeId }/${ encodeURIComponent(heading.id) }`;
      link.textContent = heading.textContent;
      link.addEventListener("click", event => {
         event.preventDefault();
         history.pushState(null, "", link.href);
         heading.scrollIntoView({ behavior : "smooth", block : "start" });
         list.querySelectorAll("a").forEach(itemLink => itemLink.removeAttribute("aria-current"));
         link.setAttribute("aria-current", "location");
      });
      item.append(link);
      list.append(item);
   });

   indexNav.append(list);
   aside.append(title, indexNav);
   movableContent.forEach(element => content.append(element));
   wrapper.append(aside, content);
   articleHeader.after(wrapper);
}

function scrollToLocationTarget() {
   const { targetId } = locationState();
   if (! targetId) {
      window.scrollTo({ top : 0, behavior : "auto" });
      return;
   }

   requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ behavior : "auto", block : "start" });
      const currentLink = app.querySelector(`.page-index a[href$="/${ CSS.escape(encodeURIComponent(
         targetId)) }"]`);
      currentLink?.setAttribute("aria-current", "location");
   });
}

function initExternalMedia() {
   if (app.querySelector(".tiktok-embed")) {
      document.querySelector("script[data-tiktok-embed]")?.remove();
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.dataset.tiktokEmbed = "";
      document.body.append(script);
   }

   if (app.querySelector(".fb-video")) {
      document.querySelector("script[data-facebook-embed]")?.remove();
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/nl_NL/sdk.js#xfbml=1&version=v21.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.dataset.facebookEmbed = "";
      document.body.append(script);
   }
}

function initEmailForms() {
   app.querySelectorAll("[data-email-form]").forEach(form => {
      form.action =
         `https://formsubmit.co/ajax/${ encodeURIComponent(SITE_CONFIG.reviewRecipient) }`;
      const submitButton = form.querySelector("[type=submit]");
      const status = form.querySelector(".form-status");

      form.addEventListener("submit", async event => {
         event.preventDefault();
         if (! form.reportValidity()) {
            return;
         }

         submitButton.disabled = true;
         status.className = "form-status";
         status.textContent = "De review wordt verstuurd…";

         try {
            const response = await fetch(form.action, {
               method  : "POST",
               body    : new FormData(form),
               headers : { Accept : "application/json" }
            });
            if (! response.ok) {
               throw new Error(`HTTP ${ response.status }`);
            }

            form.reset();
            status.classList.add("is-success");
            status.textContent = "Bedankt! Je review is verzonden.";
         } catch (error) {
            status.classList.add("is-error");
            status.textContent = "Versturen is niet gelukt. Probeer het later opnieuw.";
         } finally {
            submitButton.disabled = false;
         }
      });
   });
}

async function renderRoute() {
   const route = currentRoute();
   if (! route) {
      return;
   }

   updateNavigation(route.dataset.route);
   closeNavigation();

   if (renderedRouteId === route.dataset.route && app.querySelector(".page-shell")) {
      scrollToLocationTarget();
      return;
   }

   activeRequest?.abort();
   activeRequest = new AbortController();
   app.setAttribute("aria-busy", "true");

   try {
      const response = await fetch(route.dataset.src, { signal : activeRequest.signal });
      if (! response.ok) {
         throw new Error(String(response.status));
      }

      app.innerHTML = await response.text();
      renderedRouteId = route.dataset.route;
      const heading = app.querySelector("h1");
      document.title = heading ? `${ heading.textContent.trim() } | ${ siteTitle }` : siteTitle;
      initPageIndex(route.dataset.route);
      initEmailForms();
      initExternalMedia();
      scrollToLocationTarget();
   } catch (error) {
      if (error.name !== "AbortError") {
         app.replaceChildren(errorTemplate.content.cloneNode(true));
         renderedRouteId = "";
         document.title = siteTitle;
      }
   } finally {
      app.setAttribute("aria-busy", "false");
   }
}

menuButton.addEventListener("click", () => {
   const isOpen = nav.classList.toggle("is-open");
   menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", event => {
   if (event.target.closest("[data-route]")) {
      closeNavigation();
   }
});

document.addEventListener("click", event => {
   if (! event.target.closest(".site-header")) {
      closeNavigation();
   }
});

document.addEventListener("keydown", event => {
   if (event.key === "Escape") {
      closeNavigation();
   }
});

window.addEventListener("hashchange", renderRoute);
// hashchange also handles Back/Forward when the hash changes.
// A second popstate handler was causing duplicate route rendering.

function initializeSite() {
   try {
      buildNavigation();

      // Start loading content independently of responsive layout.
      void renderRoute();

      updateNavigationLayout();
      window.addEventListener("resize", updateNavigationLayout);
   } catch (error) {
      console.error("Lotus initialization failed:", error);

      app.setAttribute("aria-busy", "false");
      app.replaceChildren(
         errorTemplate.content.cloneNode(true)
      );
   }
}

if (document.readyState === "loading") {
   document.addEventListener(
      "DOMContentLoaded",
      initializeSite,
      { once : true }
   );
} else {
   initializeSite();
}
