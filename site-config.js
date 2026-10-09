/**
 * Eenvoudige site-instellingen.
 * Pas hier de navigatie en het e-mailadres voor reviews aan.
 */
export const SITE_CONFIG = {
   reviewRecipient          : "ontvanger@voorbeeld.nl",
   pageIndexMinimumHeadings : 4,
   navigation               : [
      {
         id    : "home",
         label : "Home",
         file  : "home.html",
         home  : true
      },
      {
         id    : "begeleiding",
         label : "Begeleiding",
         file  : "begeleiding.html"
      },
      {
         type     : "dropdown",
         label    : "Bijles & Leercoaching",
         children : [
            "basisschool",
            "voortgezet-mbo-hbo",
            "nt2-inburgering"
         ]
      },

      // These pages are rendered inside the dropdown, not as separate tabs.
      {
         id    : "basisschool",
         label : "Basisschool",
         file  : "basisschool.html"
      },
      {
         id    : "voortgezet-mbo-hbo",
         label : "Voortgezet onderwijs / MBO / HBO",
         file  : "voortgezet-mbo-hbo.html"
      },
      {
         id    : "nt2-inburgering",
         label : "NT2 & Inburgering",
         file  : "nt2-inburgering.html"
      },

      {
         id    : "werkwijze",
         label : "Werkwijze",
         file  : "werkwijze.html"
      },
      {
         id    : "over-mij",
         label : "Over mij",
         file  : "over-mij.html"
      },
      {
         id    : "reviews",
         label : "Reviews",
         file  : "reviews.html"
      },
      {
         id    : "tarieven",
         label : "Tarieven",
         file  : "tarieven.html"
      },
      {
         id    : "contact",
         label : "Contact",
         file  : "contact.html"
      },
      {
         id           : "aanmelden",
         label        : "Aanmelden",
         file         : "aanmelden.html",
         callToAction : true
      }
   ]
};
