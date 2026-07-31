// =========================================
// 1. MOBILE NAVIGATION TOGGLE
// =========================================
// When the hamburger icon is clicked, show/hide the nav links.
// This is done by toggling a CSS class called "active" (see style.css).

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close the mobile menu automatically when a link is clicked
// (nicer experience — user doesn't have to tap the hamburger again)
const allNavLinks = navLinks.querySelectorAll('a');
allNavLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});


// =========================================
// 2. CONTACT FORM SUBMISSION
// =========================================
// This is a front-end-only demo, so there is no real server to send data to.
// Instead, we stop the normal page reload and show a friendly success message.

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', function (event) {
  event.preventDefault(); // stop the form from reloading the page

  // Grab the values the user typed in
  const name = document.getElementById('name').value;

  // Show a personalized thank-you message
  formSuccess.textContent = `Thank you, ${name}! Your message has been sent. We'll get back to you soon.`;

  // Clear the form fields
  contactForm.reset();

  // Optional: hide the message again after a few seconds
  setTimeout(() => {
    formSuccess.textContent = '';
  }, 5000);
});


// =========================================
// 3. AUTO-UPDATE FOOTER YEAR
// =========================================
// Keeps the copyright year correct automatically, every year, with no manual edits.

document.getElementById('year').textContent = new Date().getFullYear();
