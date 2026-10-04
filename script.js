// Shared JS for TravelGo: year injection, simple search, gallery lightbox, contact form stub
document.addEventListener('DOMContentLoaded', () => {
  // update all footer year fields
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  // search filter on destinations page
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('#dest-grid .card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });
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
