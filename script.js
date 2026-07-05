const FORM_EMAIL = 'contact@yieldguard.ro';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_EMAIL}`;

const isRo = document.documentElement.lang?.startsWith('ro');
const t = isRo
  ? {
      subject: (company) => `Solicitare mentenanță — ${company} — YieldGuard`,
      formError: 'Trimiterea a eșuat. Contactați-ne direct la contact@yieldguard.ro.',
      modalTitle: 'Solicitare primită',
      modalDesc: 'Un reprezentant tehnic vă va contacta în maxim o zi lucrătoare.',
      modalClose: 'Închide',
      loading: 'Se trimite...',
    }
  : {
      subject: (company) => `Maintenance schedule request — ${company} — YieldGuard`,
      formError: 'Transmission failed. Please contact us directly at contact@yieldguard.ro.',
      modalTitle: 'Inquiry received',
      modalDesc: 'A technical representative will contact you within one business day.',
      modalClose: 'Close',
      loading: 'Processing...',
    };

const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const successModal = document.getElementById('success-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');

if (modalTitle) modalTitle.textContent = t.modalTitle;
if (modalDesc) modalDesc.textContent = t.modalDesc;
if (modalClose) modalClose.textContent = t.modalClose;

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.querySelector('.btn-text').classList.toggle('hidden', loading);
  submitBtn.querySelector('.btn-loading').classList.toggle('hidden', !loading);
}

modalClose?.addEventListener('click', () => {
  successModal.classList.add('hidden');
  document.body.style.overflow = '';
});

successModal?.addEventListener('click', (e) => {
  if (e.target === successModal) {
    successModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.add('hidden');

  if (contactForm.querySelector('[name="_honey"]')?.value) return;

  const fd = new FormData(contactForm);
  setLoading(true);

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        company: fd.get('company'),
        mw_installed: fd.get('mw'),
        site_location: fd.get('location'),
        _subject: t.subject(fd.get('company')),
        _template: 'table',
        _captcha: 'false',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error();
    contactForm.reset();
    successModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch {
    formError.textContent = t.formError;
    formError.classList.remove('hidden');
  } finally {
    setLoading(false);
  }
});