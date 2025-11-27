

document.addEventListener('DOMContentLoaded', () => {
  const cpfInput = document.getElementById('cpf');
  const passwordInput = document.getElementById('password');
  const form = document.getElementById('login-form');

  // Attach jQuery masks if available
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.mask) {
    if (cpfInput) window.jQuery(cpfInput).mask('000.000.000-00');
  } else {
    // no-op
  }

  // Basic client validation helpers
  function isValidCPF(value) {
    // simple length/format check; server should validate thoroughly
    return /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(value || '');
  }

  function isValidPassword(value) {
    return typeof value === 'string' && value.trim().length >= 6;
  }

  // Bootstrap-like validation styling on submit
  if (form) {
    form.addEventListener('submit', (e) => {
      let ok = true;
      if (passwordInput && !isValidPassword(passwordInput.value)) {
        passwordInput.classList.add('is-invalid');
        ok = false;
      } else if (passwordInput) {
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
      }

      if (cpfInput && !isValidCPF(cpfInput.value)) {
        cpfInput.classList.add('is-invalid');
        ok = false;
      } else if (cpfInput) {
        cpfInput.classList.remove('is-invalid');
        cpfInput.classList.add('is-valid');
      }

      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});
