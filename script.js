// Shared JS for TravelGo: year injection, simple search, gallery lightbox, contact form stub
document.addEventListener('DOMContentLoaded', () => {
  const localDateValue = () => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 10); };
  // update all footer year fields
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
  const travelDate = document.getElementById('travelDate');
  if (travelDate) travelDate.min = localDateValue();

  // search filter on destinations page
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('#dest-grid .card').forEach(card => {
        const name = `${card.dataset.name || ''} ${card.textContent || ''}`.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  // Allow the home-page search to pre-filter destinations.
  if (search && new URLSearchParams(location.search).has('q')) {
    search.value = new URLSearchParams(location.search).get('q') || '';
    search.dispatchEvent(new Event('input'));
  }

  // Package cards: show departure/group details and update group totals.
  const departureDates = ['15 Nov 2026', '22 Nov 2026', '29 Nov 2026', '06 Dec 2026'];
  const seats = [8, 6, 10, 12];
  let activeBooking = null;
  let bookingDialog = null;
  const showBookingDetails = (card, price, adultCount) => {
    if (!bookingDialog) {
      bookingDialog = document.createElement('div'); bookingDialog.className = 'booking-dialog'; bookingDialog.hidden = true;
      bookingDialog.innerHTML = `<section class="booking-panel" role="dialog" aria-modal="true" aria-labelledby="bookingTitle"><button type="button" class="booking-close" aria-label="Close booking details">×</button><div class="booking-photo"><img alt=""></div><div class="booking-content"><p class="booking-eyebrow">Your next journey</p><h2 id="bookingTitle"></h2><p class="booking-summary"></p><div class="booking-inclusions"><strong>Included in your package</strong><ul></ul><p class="booking-exclusion">Not included: personal expenses and any items not listed in the package.</p></div><form class="booking-details-form"><label class="booking-date">Start date<input name="startDate" type="date" required></label><div class="booking-count-row"><label>Adults <small>12+ years</small><span class="booking-stepper"><button type="button" data-step="adult" data-change="-1" aria-label="Remove adult">−</button><input name="adults" type="number" min="1" value="1" required><button type="button" data-step="adult" data-change="1" aria-label="Add adult">+</button></span></label><label>Children <small>5–11 years · 70% price</small><span class="booking-stepper"><button type="button" data-step="child" data-change="-1" aria-label="Remove child">−</button><input name="children" type="number" min="0" value="0"><button type="button" data-step="child" data-change="1" aria-label="Add child">+</button></span></label></div><div class="booking-total"><span>Total estimate</span><strong></strong></div><p class="booking-note">Final price may vary if your travel date has different availability.</p><fieldset class="traveller-contact" hidden><legend>Traveller contact details</legend><label>Full name<input name="travellerName" autocomplete="name"></label><label>Phone number<input name="travellerPhone" type="tel" autocomplete="tel"></label><label>Email address<input name="travellerEmail" type="email" autocomplete="email"></label></fieldset><button class="btn booking-submit" type="submit">Add to My Booking</button></form></div></section>`;
      document.body.append(bookingDialog);
      bookingDialog.querySelector('.booking-close').addEventListener('click', () => { bookingDialog.hidden = true; });
      bookingDialog.addEventListener('click', event => { if (event.target === bookingDialog) bookingDialog.hidden = true; });
      bookingDialog.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
        const input = bookingDialog.querySelector(`[name="${button.dataset.step === 'adult' ? 'adults' : 'children'}"]`);
        input.value = Math.max(Number(input.min), (Number(input.value) || 0) + Number(button.dataset.change)); input.dispatchEvent(new Event('input'));
      }));
      bookingDialog.querySelectorAll('.booking-details-form input').forEach(input => input.addEventListener('input', updateBookingTotal));
      bookingDialog.querySelector('.booking-details-form').addEventListener('submit', event => {
        event.preventDefault();
        if (!activeBooking) return;
        const form = event.currentTarget;
        if (!form.dataset.contactReady) {
          const contactFields = form.querySelector('.traveller-contact');
          contactFields.hidden = false;
          contactFields.querySelectorAll('input').forEach(input => { input.required = true; });
          form.dataset.contactReady = 'true';
          form.querySelector('.booking-submit').textContent = 'Confirm booking';
          contactFields.querySelector('[name="travellerName"]').focus();
          return;
        }
        const adults = Number(form.querySelector('[name="adults"]').value); const children = Number(form.querySelector('[name="children"]').value);
        const bookings = JSON.parse(localStorage.getItem('travelgoBookings') || '[]');
        bookings.unshift({ id: Date.now(), package: activeBooking.name, adults, children, members: adults + children, name: form.querySelector('[name="travellerName"]').value.trim(), phone: form.querySelector('[name="travellerPhone"]').value.trim(), email: form.querySelector('[name="travellerEmail"]').value.trim(), total: adults * activeBooking.price + children * activeBooking.price * 0.7, date: form.querySelector('[name="startDate"]').value, status: 'upcoming', created: new Date().toLocaleDateString() });
        localStorage.setItem('travelgoBookings', JSON.stringify(bookings)); location.href = 'booking.html';
      });
    }
    activeBooking = { name: card.dataset.package, price };
    const image = card.querySelector('img'); const dialogImage = bookingDialog.querySelector('.booking-photo img');
    dialogImage.src = image ? image.src : ''; dialogImage.alt = image ? image.alt : activeBooking.name;
    bookingDialog.querySelector('#bookingTitle').textContent = activeBooking.name;
    bookingDialog.querySelector('.booking-summary').textContent = card.querySelector('p:not(.price):not(.trip-meta):not(.total-price)')?.textContent || 'A thoughtfully planned journey with local experiences and comfortable stays.';
    const inclusionList = bookingDialog.querySelector('.booking-inclusions ul'); inclusionList.replaceChildren();
    const items = Array.from(card.querySelectorAll('.inclusions li')).map(item => item.textContent.trim());
    (items.length ? items : ['Comfortable accommodation', 'Local transfers', 'Guided experiences']).forEach(text => { const li = document.createElement('li'); li.textContent = text; inclusionList.append(li); });
    const form = bookingDialog.querySelector('.booking-details-form');
    form.querySelector('[name="startDate"]').min = localDateValue(); form.querySelector('[name="startDate"]').value = '';
    form.querySelector('[name="adults"]').value = Math.max(1, adultCount); form.querySelector('[name="children"]').value = '0';
    form.dataset.contactReady = ''; form.querySelector('.traveller-contact').hidden = true;
    form.querySelectorAll('.traveller-contact input').forEach(field => { field.required = false; field.value = ''; });
    form.querySelector('.booking-submit').textContent = 'Add to My Booking';
    bookingDialog.hidden = false; updateBookingTotal(); bookingDialog.querySelector('.booking-close').focus();
  };
  function updateBookingTotal() {
    if (!bookingDialog || !activeBooking) return;
    const form = bookingDialog.querySelector('.booking-details-form');
    const adults = Number(form.querySelector('[name="adults"]').value) || 0; const children = Number(form.querySelector('[name="children"]').value) || 0;
    bookingDialog.querySelector('.booking-total strong').textContent = `₹${Math.round(adults * activeBooking.price + children * activeBooking.price * 0.7).toLocaleString('en-IN')}`;
  }
  const packagesGrid = document.querySelector('.packages-grid');
  if (packagesGrid) [
    ['Munnar Hills Escape', 18999, '5 Days / 4 Nights — Tea country scenery, guided garden walks and local stays.', 'https://images.unsplash.com/photo-1672219386269-486cbbe9a50f?auto=format&fit=crop&w=1000&q=80'],
    ['Agra Mughal Heritage', 13999, '4 Days / 3 Nights — Explore Agra Fort, the Taj Mahal and the old city.', './assets/agra-fort-agra-uttar pradesh-3-attr-hero.jpg']
  ].forEach(([name, price, description, image]) => {
    const card = document.createElement('article'); card.className = 'card package'; card.dataset.package = name; card.dataset.price = price;
    const img = document.createElement('img'); img.src = image; img.alt = name;
    const title = document.createElement('h3'); title.textContent = name;
    const amount = document.createElement('p'); amount.className = 'price'; amount.textContent = `₹${price.toLocaleString('en-IN')} / person`;
    const desc = document.createElement('p'); desc.textContent = description;
    const button = document.createElement('button'); button.className = 'btn book-package'; button.type = 'button'; button.textContent = 'Book Now';
    card.append(img, title, amount, desc, button); packagesGrid.append(card);
  });
  document.querySelectorAll('.packages-grid .package').forEach((card, index) => {
    if (!card.dataset.price) {
      const amount = parseInt((card.querySelector('.price')?.textContent || '').replace(/[^0-9]/g, ''), 10) || [15999, 22499, 12999, 10000][index % 4];
      card.dataset.price = amount;
      card.dataset.package = card.querySelector('h3')?.textContent.trim() || 'Travel package';
    }
    const price = Number(card.dataset.price);
    const img = card.querySelector('img');
    if (!img) {
      const pics = ['./assets/taj front.jpg', './assets/kerala.jpg', './assets/beach-goa-india_78361-4735.avif', './assets/East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg'];
      const picture = document.createElement('img'); picture.src = pics[index % pics.length]; picture.alt = card.dataset.package; card.prepend(picture);
    }
    if (img.src.includes('East_facade_Hawa_Mahal')) img.classList.add('hawa-mahal-photo');
    const legacyPrice = card.querySelector('.price');
    if (legacyPrice) legacyPrice.textContent = `₹${price.toLocaleString('en-IN')} / person`;
    const details = document.createElement('p'); details.className = 'trip-meta';
    details.innerHTML = `Next departure: <strong>${departureDates[index % departureDates.length]}</strong> · <strong>${seats[index % seats.length]} spots left</strong>`;
    card.insertBefore(details, card.querySelector('.price')?.nextSibling || null);
    const picker = document.createElement('label'); picker.className = 'member-picker'; picker.textContent = 'Travellers ';
    const input = document.createElement('input'); input.type = 'number'; input.min = '1'; input.max = String(seats[index % seats.length]); input.value = '1'; input.className = 'member-count'; picker.append(input); card.append(picker);
    const total = document.createElement('p'); total.className = 'total-price'; total.innerHTML = `Total: <strong>₹${price.toLocaleString('en-IN')}</strong>`; card.append(total);
    input.addEventListener('input', () => { const count = Math.max(1, Math.min(Number(input.max), Number(input.value) || 1)); input.value = count; total.querySelector('strong').textContent = `₹${(price * count).toLocaleString('en-IN')}`; });
    let bookButton = card.querySelector('.book-package');
    if (!bookButton) {
      bookButton = card.querySelector('a.btn');
      if (bookButton) bookButton.classList.add('book-package');
      else { bookButton = document.createElement('button'); bookButton.className = 'btn book-package'; bookButton.type = 'button'; bookButton.textContent = 'Book Now'; card.append(bookButton); }
    }
    if (bookButton) bookButton.addEventListener('click', (event) => {
      event.preventDefault();
      showBookingDetails(card, price, Number(input.value));
    });
  });

  // Render saved bookings and allow completed trips to move into history.
  const upcoming = document.getElementById('upcomingBookings');
  const history = document.getElementById('bookingHistory');
  if (upcoming && history) {
    const bookings = JSON.parse(localStorage.getItem('travelgoBookings') || '[]');
    const draw = (item, target) => {
      const row = document.createElement('article'); row.className = 'booking-row';
      row.innerHTML = `<div><h3></h3><p></p><small></small></div><strong></strong>`;
      row.querySelector('h3').textContent = item.package; row.querySelector('p').textContent = `${item.date} · ${item.members} traveller${item.members === 1 ? '' : 's'}`;
      row.querySelector('small').textContent = `Booked ${item.created}${item.name ? ` · ${item.name} · ${item.phone} · ${item.email}` : ''}`; row.querySelector('strong').textContent = `₹${Number(item.total).toLocaleString('en-IN')}`;
      if (target === upcoming) { const done = document.createElement('button'); done.className = 'btn small'; done.textContent = 'Move to history'; done.addEventListener('click', () => { item.status = 'history'; localStorage.setItem('travelgoBookings', JSON.stringify(bookings)); location.reload(); }); row.append(done); }
      target.append(row);
    };
    bookings.filter(x => x.status === 'upcoming').forEach(x => draw(x, upcoming)); bookings.filter(x => x.status === 'history').forEach(x => draw(x, history));
    document.getElementById('noBookings').hidden = bookings.length > 0;
  }

  // gallery & detail lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('closeLightbox');

  const galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img'));
  const detailImgs = Array.from(document.querySelectorAll('.detail-gallery img'));
  const destGridImgs = Array.from(document.querySelectorAll('#dest-grid .card img'));
  const lightboxTargets = galleryImgs.concat(detailImgs, destGridImgs);

  lightboxTargets.forEach(img => {
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      if (!lightbox || !lightboxImg) return;
      // prefer data-large if present, otherwise use src
      const large = img.dataset.large || img.src;
      lightboxImg.src = large;
      lightbox.classList.remove('hidden');
      e.stopPropagation();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => { if (lightbox) lightbox.classList.add('hidden'); });
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.add('hidden'); });

  // contact form stub
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    const packageSelect = document.getElementById('package');
    const otherPackageField = document.getElementById('otherPackageField');
    const otherPackageInput = document.getElementById('otherPackage');
    const updateOtherPackageField = () => {
      if (!packageSelect || !otherPackageField || !otherPackageInput) return;
      const isOther = packageSelect.value === 'Other';
      otherPackageField.hidden = !isOther;
      otherPackageInput.required = isOther;
      if (!isOther) otherPackageInput.value = '';
    };

    if (packageSelect) packageSelect.addEventListener('change', updateOtherPackageField);
    updateOtherPackageField();

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = (document.getElementById('name') || {}).value || 'Guest';
      if (formSuccess) formSuccess.textContent = `Thank you, ${name}! Your message has been received.`;
      contactForm.reset();
      updateOtherPackageField();
      setTimeout(() => { if (formSuccess) formSuccess.textContent = ''; }, 5000);
    });
  }

  // mobile nav toggle (if present)
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('active')));
  }
});
