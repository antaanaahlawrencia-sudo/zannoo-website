ZANNOO INTERNATIONAL SCHOOL WEBSITE - HAND-OVER GUIDE
=====================================================
The site is plain HTML, CSS and JavaScript. No installation needed.
Pages: index, about, admissions, fees, academics, gallery, news, staff, faq, contact, privacy, 404.

1) FILL IN THE YELLOW PLACEHOLDERS (search each .html file for  class="fill")
   - about.html    : the Principal's welcome message (name is already filled in)
   - contact.html  : office hours and a Google Maps link (address is filled in)
   - fees.html     : fees per level (Pre-School, KS1, KS2, KS3) and term dates (payment details and fee policy are filled in)
   - news.html     : next announcements and upcoming events
   - privacy.html  : "last updated" date
   Delete the <mark class="fill"> tags once you replace the text, so the yellow highlight goes away.
   The Mission, Vision, story, policies and compliance now come from the school's own Principal presentation.

2) ADD REAL CONTENT
   - Home page: the top now shows a slideshow of the real school building and a student. To use a school video instead,
     follow the comment inside the "slides" block in index.html (MP4, compressed, under 15 MB).
   - News bar: the scrolling strip under the top bar is in every page (search for class="newsbar"); edit the links in the
     same order on each page, or ask for an update.
   - Gallery: add photos and more TikTok videos in gallery.html.
   - Staff: add real names, roles and photos in staff.html.

3) SAVE ENQUIRIES
   RECOMMENDED: follow SETUP-BACKEND.txt (database + staff dashboard at admin.html).
   SIMPLER ALTERNATIVE: Google Sheet, as below.
   a. Create a Google Sheet called "Zannoo Enquiries" in the school's Google account.
   b. Open Extensions > Apps Script, delete the sample code and paste:

      function doPost(e) {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sh = ss.getSheetByName('Enquiries') || ss.insertSheet('Enquiries');
        var p = e.parameter;
        sh.appendRow([new Date(), p.type, p.parent || p.name, p.phone, p.email, p.child || '', p.grade || '', p.message || '']);
        MailApp.sendEmail('zannoo.int.sch@gmail.com', 'New website enquiry: ' + p.type, JSON.stringify(p, null, 2));
        return ContentService.createTextOutput('ok');
      }

   c. Click Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy, allow permissions.
   d. Copy the Web app URL and paste it between the quotes in script.js:  var FORM_ENDPOINT = '';
   e. Test both forms. Each enquiry appears in the sheet and is emailed to the school.
   (Alternative: a Formspree form URL works in the same place.)
   Until the URL is set, the forms open the parent's email app or WhatsApp instead.

4) PUT IT ONLINE
   - Easiest: Netlify (app.netlify.com/drop). Drag this whole folder in. Free HTTPS.
     Other options: GitHub Pages, Cloudflare Pages, or any web host (upload all files to public_html).
   - Buy a domain (for example zannoo.edu.gh or a .com) and connect it in the host's settings.
   - After you have the domain, open sitemap.xml and robots.txt and replace YOUR-DOMAIN with it.
   - Register the site in Google Search Console and submit sitemap.xml.

5) BEFORE LAUNCH CHECKLIST
   [ ] All yellow placeholders replaced      [ ] School video and real photos added
   [ ] Phone, email, WhatsApp correct        [ ] Forms tested and saving to the sheet
   [ ] Privacy policy reviewed by the school (it is a general template, not legal advice)
   [ ] Site checked on a phone               [ ] Domain connected, sitemap updated
