// Zannoo International School - shared behaviour
(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // Home page background video: plays muted, loops through the clips
  var hv = document.getElementById('hv'), pb = document.getElementById('vpause');
  if (hv && pb) {
    var clips = ['28315', '28320'], ci = 0;
    hv.muted = true;
    hv.removeAttribute('loop');
    hv.addEventListener('ended', function () {
      ci = (ci + 1) % clips.length;
      hv.src = 'https://assets.mixkit.co/videos/' + clips[ci] + '/' + clips[ci] + '-720.mp4';
      hv.play().catch(function () {});
    });
    hv.addEventListener('error', function () { hv.style.display = 'none'; pb.hidden = true; }, true);
    pb.addEventListener('click', function () {
      if (hv.paused) { hv.play(); pb.textContent = 'Pause video'; }
      else { hv.pause(); pb.textContent = 'Play video'; }
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { hv.pause(); pb.textContent = 'Play video'; }
  }

  // Gentle reveal on scroll + back-to-top button (skipped if the visitor prefers less motion)
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(document.querySelectorAll('.card,.panel,.item,.steps li,.scroll,.faq details,.tt,.note'), function (el, i) {
      el.classList.add('rv'); el.style.animationDelay = ((i % 4) * 80) + 'ms'; io.observe(el);
    });
  }
  var up = document.createElement('button');
  up.className = 'totop'; up.type = 'button'; up.setAttribute('aria-label', 'Back to top'); up.innerHTML = '&#8593;';
  document.body.appendChild(up);
  window.addEventListener('scroll', function () { up.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }); });

  // Enquiry and contact forms
  var LABELS = { parent: 'Parent', name: 'Name', phone: 'Phone', email: 'Email', child: 'Child', grade: 'Class', message: 'Message' };

  function wire(form) {
    var done = document.getElementById('sent');
    function setError(field, msg) {
      var box = form.querySelector('[data-err="' + field.name + '"]');
      if (box) box.textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function finish(html) { done.innerHTML = html; form.hidden = true; done.hidden = false; done.focus(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var v = f.value.trim(), msg = '';
        if (!v) msg = 'Please fill in this field.';
        else if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) msg = 'Enter a valid email address.';
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 9) msg = 'Enter a valid phone number.';
        setError(f, msg);
        if (msg) ok = false;
      });
      if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

      var type = form.getAttribute('data-type'), data = {}, lines = [type];
      Array.prototype.forEach.call(form.elements, function (f) {
        if (!f.name) return;
        var v = f.value.trim();
        data[f.name] = v;
        if (LABELS[f.name] && v) lines.push(LABELS[f.name] + ': ' + v);
      });
      var text = lines.join('\n'), who = data.child || data.name || '';
      var mail = 'mailto:zannoo.int.sch@gmail.com?subject=' + encodeURIComponent(type + ' - ' + who) + '&body=' + encodeURIComponent(text);
      var wa = 'https://wa.me/233504777497?text=' + encodeURIComponent(text);
      var fallback = '<strong>Almost done.</strong> Your message is ready to send. Choose how:' +
        '<div class="sent-actions"><a class="btn" href="' + mail + '">Send by email</a>' +
        '<a class="btn wa" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp</a></div>';

      var thanks = '<strong>Thank you.</strong> We have received your message and will contact you soon. ' +
        'In a hurry? <a href="' + wa + '" target="_blank" rel="noopener">Message us on WhatsApp</a>.';
      if (data.website) { finish(thanks); return; }   // hidden spam trap: real visitors leave it empty
      var sbUrl = window.SUPABASE_URL, sbKey = window.SUPABASE_ANON_KEY, ep = window.FORM_ENDPOINT;
      if (!(sbUrl && sbKey) && !ep) { finish(fallback); return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Sending...';
      var jobs = [];
      if (sbUrl && sbKey) {
        var row = { type: type, parent_name: data.parent || data.name, phone: data.phone, email: data.email,
          child_name: data.child || null, grade: data.grade || null, message: data.message || null };
        jobs.push(fetch(sbUrl + '/rest/v1/enquiries', { method: 'POST',
          headers: (function () { var h = { 'Content-Type': 'application/json', apikey: sbKey, Prefer: 'return=minimal' };
            if (sbKey.indexOf('sb_') !== 0) h.Authorization = 'Bearer ' + sbKey;   // old-style JWT keys need this; new sb_publishable keys must not send it
            return h; })(),
          body: JSON.stringify(row) }).then(function (r) { if (!r.ok) throw new Error('save failed'); }));
      }
      if (ep) {   // optional email alert through Google Apps Script
        var alertJob = fetch(ep, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }).catch(function () {});
        if (!jobs.length) jobs.push(alertJob);
      }
      Promise.all(jobs).then(function () { finish(thanks); })
        .catch(function () { btn.disabled = false; btn.textContent = 'Continue'; finish(fallback); });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('form[data-type]'), wire);
})();
