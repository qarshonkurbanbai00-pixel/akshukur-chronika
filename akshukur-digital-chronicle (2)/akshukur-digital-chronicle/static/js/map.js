/* ============================================================
   map.js — Leaflet интерактивті картасы
   CDN жүктелмесе (интернетсіз режим) fallback хабарлама көрсетіледі.
   ============================================================ */
(function () {
  'use strict';
  const mapEl = document.getElementById('map');
  const fallback = document.getElementById('mapFallback');
  if (!mapEl) return;

  // Leaflet жүктелмесе — жоба бұзылмайды, түсіндірме шығарамыз
  if (typeof L === 'undefined') {
    mapEl.style.display = 'none';
    if (fallback) fallback.hidden = false;
    return;
  }

  const CENTER = [43.7832, 51.0605]; // Ақшұқыр (ашық картографиялық дереккөз)
  const map = L.map(mapEl, { scrollWheelZoom: true }).setView(CENTER, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> қатысушылары'
  }).addTo(map);

  const EV_LABELS = {
    written: '🟢 Жазба дерек', archive: '🔵 Архив дерегі', oral: '🟡 Ауызша дерек',
    research: '🟠 Зерттеу материалы', reconstruction: '🟣 3D реконструкция', needs_data: '⚪ Дерек қажет'
  };
  const CAT_COLORS = {
    auyl: '#2ecc71', qorym: '#e8c47a', medrese: '#a855f7', mektep: '#3b82f6', tulga: '#f97316'
  };

  function markerIcon(cat) {
    const color = CAT_COLORS[cat] || '#d9b36c';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
             background:${color};border:2px solid #0b1526;box-shadow:0 4px 12px rgba(0,0,0,.5)"></div>`,
      iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
    });
  }

  const markers = {}; // place_id -> marker

  fetch('/api/places')
    .then(r => r.json())
    .then(places => {
      const group = [];
      places.forEach(p => {
        if (p.lat === null || p.lng === null) return; // координатасыз нүкте картада көрсетілмейді
        const ev = EV_LABELS[p.evidence] || EV_LABELS.needs_data;
        const srcLinks = (p.sources || []).map(sid =>
          `<a href="/derek-kozder#${sid}" style="color:#e8c47a">${sid}</a>`).join(' · ');
        const imgHtml = p.image
          ? `<img src="/static/${p.image}" alt="${p.name}" style="border-radius:8px;margin:8px 0">`
          : `<div style="padding:10px;border:1px dashed rgba(232,196,122,.4);border-radius:8px;color:#9fb0c6;font-size:.8rem;margin:8px 0">Фото кейін енгізіледі</div>`;
        const m = L.marker([p.lat, p.lng], { icon: markerIcon(p.category) })
          .addTo(map)
          .bindPopup(
            `<strong>${p.name}</strong><br>
             <span class="popup-ev">${ev}</span>
             ${imgHtml}
             <span style="font-size:.85rem;color:#c6d2e2">${p.summary}</span>
             ${srcLinks ? `<div style="margin-top:6px;font-size:.78rem">Дереккөз: ${srcLinks}</div>` : ''}`,
            { maxWidth: 300 }
          );
        markers[p.id] = m;
        group.push(m);
      });
      if (group.length > 1) map.fitBounds(L.featureGroup(group).getBounds().pad(0.25));

      // Бүйірлік тізімнен басқанда маркерді ашу
      document.querySelectorAll('.place-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.place;
          const m = markers[id];
          if (m) {
            map.flyTo(m.getLatLng(), 15, { duration: 1 });
            setTimeout(() => m.openPopup(), 1000);
          } else {
            // Координатасыз нүкте — карточкасына скролл
            const card = document.getElementById('card-' + id);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });
    })
    .catch(() => {
      mapEl.style.display = 'none';
      if (fallback) fallback.hidden = false;
    });
})();
