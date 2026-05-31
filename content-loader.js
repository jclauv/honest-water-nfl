(async function () {
  try {
    const res = await fetch('/content.json');
    if (!res.ok) return;
    const c = await res.json();
    applyContent(c);
  } catch (_) { /* running as file://, skip */ }
})();

function applyContent(c) {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  /* ── COLORS ── */
  if (c.colors) {
    const r = document.documentElement.style;
    if (c.colors.navy) r.setProperty('--navy', c.colors.navy);
    if (c.colors.teal) { r.setProperty('--teal', c.colors.teal); r.setProperty('--accent', c.colors.teal); }
  }

  /* ── CONTACT ── */
  if (c.contact) {
    $$('[href^="tel:"]').forEach(el => {
      el.href = 'tel:' + c.contact.phoneTel;
      if (el.textContent.trim().startsWith('(') || el.textContent.includes('📞')) {
        el.textContent = el.textContent.includes('📞') ? '📞 ' + c.contact.phone : c.contact.phone;
      }
    });
    $$('.nav-phone').forEach(el => el.textContent = c.contact.phone);
    $$('[href^="mailto:"]').forEach(el => {
      el.href = 'mailto:' + c.contact.email;
      if (el.textContent !== 'Email Us') el.textContent = c.contact.email;
    });
    $$('.cdetail-val, .f-contact-item span').forEach(el => {
      if (el.innerHTML.includes('Sanford') || el.innerHTML.includes('1st Street')) el.innerHTML = c.contact.address;
      if (el.innerHTML.includes('Mon') && el.innerHTML.includes('Sat')) el.innerHTML = c.contact.hours;
    });
  }

  /* ── HERO ── */
  if (c.hero) {
    const badge = $('.hero-badge');
    if (badge) { badge.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:var(--teal);display:inline-block"></span> ${c.hero.badge}`; }
    const h1 = $('section#home h1');
    if (h1) h1.innerHTML = `${c.hero.line1}<br>${c.hero.line2} <span class="accent">${c.hero.accent}</span><br>${c.hero.line3}`;
    const sub = $('.hero-sub');
    if (sub) sub.textContent = c.hero.subtitle;
    const painList = $('.pain-list');
    if (painList && c.hero.painPoints) {
      painList.innerHTML = c.hero.painPoints.map(p =>
        `<li><span class="pain-x">✕</span> ${p}</li>`).join('');
    }
    const ctaBtns = $$('.hero-btns .btn');
    if (ctaBtns[0] && c.hero.cta1) ctaBtns[0].textContent = c.hero.cta1;
    if (ctaBtns[1] && c.hero.cta2) ctaBtns[1].textContent = c.hero.cta2;
  }

  /* ── PRICING CARD ── */
  if (c.pricing) {
    const p = c.pricing;
    if ($('.hcard-title')) $('.hcard-title').textContent = p.cardTitle;
    if ($('.hcard-sub')) $('.hcard-sub').textContent = p.cardSubtitle;
    if ($('.hcard-price-old')) $('.hcard-price-old').textContent = p.cardPriceOld;
    if ($('.hcard-price')) $('.hcard-price').textContent = p.cardPrice;
    if ($('.hcard-save')) $('.hcard-save').textContent = p.cardSave;
    const hList = $('.hcard-list');
    if (hList && p.cardFeatures) {
      hList.innerHTML = p.cardFeatures.map(f =>
        `<li><span class="hcard-check">✓</span> ${f}</li>`).join('');
    }
    if ($('.hcard-badge-text strong') && p.cardBadgeText) {
      const bt = $('.hcard-badge-text');
      if (bt) bt.innerHTML = `<strong>Assembled in the USA</strong> ${p.cardBadgeText}`;
    }
  }

  /* ── TRUST BAR ── */
  if (c.trust) {
    const bar = $('.trust-bar');
    if (bar) {
      bar.innerHTML = c.trust.map(t => `
        <div class="trust-item">
          <div class="trust-icon">${t.icon}</div>
          <div class="trust-title">${t.title}</div>
          <div class="trust-desc">${t.desc}</div>
        </div>`).join('');
    }
  }

  /* ── BUILD SECTION ── */
  if (c.build) {
    const b = c.build;
    const sl = $('#build .section-label'); if (sl) sl.textContent = b.label;
    const st = $('#build .section-title'); if (st) st.textContent = b.title;
    const sd = $('#build .section-desc'); if (sd) sd.textContent = b.desc;
    const po = $('#build .price-old'); if (po) po.textContent = b.priceOld;
    const pn = $('#build .price-new'); if (pn) pn.textContent = b.priceNew;
    const pt = $('#build .price-tag'); if (pt) pt.textContent = b.priceTag;
    const bl = $('#build .build-list'); if (bl && b.features) {
      bl.innerHTML = b.features.map(f => `<li>${f}</li>`).join('');
    }
    const bc = $('#build .btn'); if (bc) bc.textContent = b.cta;
  }

  /* ── OUR STORY ── */
  if (c.story) {
    const s = c.story;
    const sl = $('#our-story .section-label'); if (sl) sl.textContent = s.label;
    const st = $('#our-story .section-title'); if (st) st.textContent = s.title;
    const ps = $$('#our-story p');
    if (ps[0] && s.body1) ps[0].textContent = s.body1;
    if (ps[1] && s.body2) ps[1].style && (ps[1].textContent = s.body2);
    const sc = $('#our-story .btn'); if (sc) sc.textContent = s.cta;
    const stats = $$('.stat-card');
    if (stats.length && s.stats) {
      s.stats.forEach((stat, i) => {
        if (stats[i]) {
          stats[i].querySelector('.stat-num').textContent = stat.num;
          stats[i].querySelector('.stat-label').textContent = stat.label;
        }
      });
    }
  }

  /* ── SERVICE AREAS ── */
  if (c.serviceAreas) {
    const sa = c.serviceAreas;
    const sl = $('#service-areas .section-label'); if (sl) sl.textContent = sa.label;
    const st = $('#service-areas .section-title'); if (st) st.textContent = sa.title;
    const grid = $('.areas-grid');
    if (grid && sa.areas) {
      grid.innerHTML = sa.areas.map(a => `
        <div class="area-card">
          <div class="area-icon">📍</div>
          <div class="area-name">${a.name}</div>
          <div class="area-cities">${a.cities}</div>
        </div>`).join('');
    }
  }

  /* ── TESTIMONIALS ── */
  if (c.testimonials) {
    const grid = $('.reviews-grid');
    if (grid) {
      grid.innerHTML = c.testimonials.map(t => `
        <div class="review-card">
          <div class="stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="review-text">"${t.text}"</p>
          <div class="reviewer">
            <div class="reviewer-avatar">${t.initials}</div>
            <div>
              <div class="reviewer-name">${t.name}</div>
              <div class="reviewer-location">${t.location}</div>
            </div>
          </div>
        </div>`).join('');
    }
  }

  /* ── FAQ ── */
  if (c.faqs) {
    const list = $('.faq-list');
    if (list) {
      list.innerHTML = c.faqs.map(f => `
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)">${f.question} <span class="faq-icon">+</span></div>
          <div class="faq-a">${f.answer}</div>
        </div>`).join('');
    }
  }

  /* ── BLOG ── */
  if (c.blog) {
    const grid = $('.blog-grid');
    if (grid) {
      grid.innerHTML = c.blog.map(b => `
        <div class="blog-card">
          <div class="blog-img"><img src="${b.image}" alt="${b.title}" /></div>
          <div class="blog-body">
            <span class="blog-category">${b.category}</span>
            <div class="blog-title">${b.title}</div>
            <div class="blog-date">${b.date}</div>
          </div>
        </div>`).join('');
    }
  }

  /* ── CTA BANNER ── */
  if (c.cta) {
    const ct = $('#contact h2'); if (ct) ct.textContent = c.cta.title;
    const cp = $('#contact p'); if (cp) cp.textContent = c.cta.desc;
  }

  /* ── FOOTER ── */
  if (c.footer) {
    const fa = $('.footer-brand p'); if (fa) fa.textContent = c.footer.about;
    const copy = $('.footer-bottom span'); if (copy) copy.textContent = c.footer.copyright;
    const loc = $$('.footer-bottom span')[1]; if (loc) loc.textContent = c.footer.location;
    const socials = $$('.social-link');
    if (socials[0] && c.footer.socialFacebook) socials[0].href = c.footer.socialFacebook;
    if (socials[1] && c.footer.socialTiktok) socials[1].href = c.footer.socialTiktok;
    if (socials[2] && c.footer.socialInstagram) socials[2].href = c.footer.socialInstagram;
  }
}
