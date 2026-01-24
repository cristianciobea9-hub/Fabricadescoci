(() => {
  function qsa(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  function initNav() {
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = qsa('.nav-menu a');
    if (!nav || !links.length) return;

    function closeMenu() {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    function setInitialActive() {
      links.forEach((x) => x.classList.remove('active'));
      let matched = false;

      links.forEach((link) => {
        const target = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
        if (target) {
          const normalized = target.toLowerCase();
          const base = normalized.replace('.html', '');
          if (normalized === currentPage || (currentPage === '' && normalized === 'index.html')) {
            link.classList.add('active');
            matched = true;
            return;
          }
          if (!matched && base && base !== 'index' && currentPage.includes(base)) {
            link.classList.add('active');
            matched = true;
          }
        }
      });

      if (!matched && /banda/i.test(currentPage)) {
        const productsLink = links.find((l) => (l.getAttribute('href') || '').toLowerCase().includes('produse'));
        if (productsLink) productsLink.classList.add('active');
      }
    }

    setInitialActive();

    links.forEach((link) => {
      link.addEventListener('click', function () {
        links.forEach((x) => x.classList.remove('active'));
        this.classList.add('active');
        closeMenu();
      });
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        const open = nav.classList.toggle('is-open');
        document.body.classList.toggle('nav-open', open);
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.getElementById(href.slice(1));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initHeaderAutoHide() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const currentY = window.scrollY;
      if (currentY <= 8) {
        document.body.classList.remove('header-hidden');
      } else {
        document.body.classList.add('header-hidden');
      }
      lastY = currentY;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initOfferReveal() {
    const animated = qsa('[data-animate]');
    if (!animated.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || prefersReduced) {
      animated.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    animated.forEach((el, idx) => {
      el.style.transitionDelay = `${Math.min(idx, 8) * 0.05}s`;
      observer.observe(el);
    });
  }

  initNav();
  initSmoothScroll();
  initHeaderAutoHide();
  initOfferReveal();

  const form = document.getElementById('offer-form');
  if (!form) {
    return;
  }

  const steps = Array.from(document.querySelectorAll('.form-step'));
  const stepItems = Array.from(document.querySelectorAll('.step'));
  const progressBar = document.getElementById('progress-bar');
  const errorSummary = document.getElementById('error-summary');
  const errorList = document.getElementById('error-list');
  const prevBtn = document.getElementById('prev-step');
  const nextBtn = document.getElementById('next-step');
  const saveBtn = document.getElementById('save-btn');
  const previewBtn = document.getElementById('preview-btn');
  const resetBtn = document.getElementById('reset-btn');
  const submitBtn = document.getElementById('submit-btn');
  const statusMessage = document.getElementById('form-status');
  const requestIdInput = document.getElementById('requestId');
  const requestTimestampInput = document.getElementById('requestTimestamp');
  const autosaveStatus = document.getElementById('autosave-status');

  const fieldFullName = document.getElementById('field-fullName');
  const fieldCompanyName = document.getElementById('field-companyName');
  const fieldCui = document.getElementById('field-cui');
  const fieldRegCom = document.getElementById('field-regcom');
  const fieldContactPerson = document.getElementById('field-contactPerson');
  const countySelect = document.getElementById('county');
  const countyOtherField = document.getElementById('field-countyOther');

  const tapeTypeSelect = document.getElementById('tapeType');
  const tapeTypeOtherField = document.getElementById('field-tapeTypeOther');
  const tapeWidthSelect = document.getElementById('tapeWidth');
  const tapeWidthOtherField = document.getElementById('field-tapeWidthOther');
  const tapeLengthSelect = document.getElementById('tapeLength');
  const tapeLengthOtherField = document.getElementById('field-tapeLengthOther');
  const tapeThicknessSelect = document.getElementById('tapeThickness');
  const tapeThicknessOtherField = document.getElementById('field-tapeThicknessOther');
  const tapeColorSelect = document.getElementById('tapeColor');
  const tapeColorOtherField = document.getElementById('field-tapeColorOther');
  const adhesiveSelect = document.getElementById('adhesiveType');
  const adhesiveOtherField = document.getElementById('field-adhesiveOther');

  const printToggle = document.getElementById('printEnabled');
  const printFields = document.getElementById('print-fields');
  const printText = document.getElementById('printText');
  const printColorOtherToggle = document.getElementById('printColorOtherToggle');
  const printColorOtherField = document.getElementById('field-printColorOther');
  const colorSummary = document.getElementById('color-summary');
  const printColorCount = document.getElementById('printColorCount');
  const printRepeatSelect = document.getElementById('printRepeat');
  const printRepeatOtherField = document.getElementById('field-printRepeatOther');
  const printPositionSelect = document.getElementById('printPosition');
  const printPositionOtherField = document.getElementById('field-printPositionOther');
  const logoInput = document.getElementById('logo');
  const logoFileMeta = document.getElementById('logoFileMeta');
  const noLogoLater = document.getElementById('noLogoLater');
  const noLogoField = document.getElementById('field-noLogoLater');

  const packagingSelect = document.getElementById('packaging');
  const packagingOtherField = document.getElementById('field-packagingOther');
  const deadlineSelect = document.getElementById('deadline');
  const deadlineDateField = document.getElementById('field-deadlineDate');
  const paymentSelect = document.getElementById('payment');
  const paymentOtherField = document.getElementById('field-paymentOther');

  const localityInput = document.getElementById('locality');
  const deliveryCityInput = document.getElementById('deliveryCity');
  const vatInfo = document.getElementById('vatInfo');
  const summaryContent = document.getElementById('summary-content');

  const previewModal = document.getElementById('preview-modal');
  const previewContent = document.getElementById('preview-content');
  const previewClose = document.getElementById('preview-close');
  const previewPrint = document.getElementById('preview-print');
  const previewSubmit = document.getElementById('preview-submit');

  const STORAGE_KEY = 'fabricadescoci_oferta_form';
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  let currentStepIndex = 0;
  let deliveryCityEdited = false;
  let saveTimer;
  let autosaveHideTimer;
  let isSubmitting = false;

  const clientTypeRadios = Array.from(form.querySelectorAll('input[name="clientType"]'));

  const requiredByStep = {
    1: ['phone', 'email', 'locality', 'county', 'country', 'address'],
    2: ['tapeType', 'tapeWidth', 'tapeLength', 'tapeColor'],
    3: [],
    4: ['quantity', 'packaging', 'deadline'],
    5: ['deliveryMethod', 'deliveryCity', 'payment']
  };

  function getClientType() {
    const selected = clientTypeRadios.find((radio) => radio.checked);
    return selected ? selected.value : '';
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.classList.toggle('is-hidden', !visible);
  }

  function setError(element, message) {
    if (!element) return;
    const field = element.closest('.field') || element;
    const errorEl = field.querySelector('.field-error') || document.getElementById(`error-${element.id}`);
    if (errorEl) {
      errorEl.textContent = message;
    }
    field.classList.add('has-error');
    if (element instanceof HTMLElement) {
      element.setAttribute('aria-invalid', 'true');
    }
  }

  function clearErrors(scope) {
    const container = scope || document;
    container.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
    });
    container.querySelectorAll('.has-error').forEach((el) => {
      el.classList.remove('has-error');
    });
    container.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function updateConditional() {
    const isFirm = getClientType() === 'firma';
    setVisible(fieldFullName, !isFirm);
    setVisible(fieldCompanyName, isFirm);
    setVisible(fieldCui, isFirm);
    setVisible(fieldRegCom, isFirm);
    setVisible(fieldContactPerson, isFirm);
    const countyValue = countySelect ? countySelect.value.toLowerCase() : '';
    setVisible(countyOtherField, countyValue === 'altul');

    setVisible(tapeTypeOtherField, tapeTypeSelect.value === 'altul');
    setVisible(tapeWidthOtherField, tapeWidthSelect.value === 'other');
    setVisible(tapeLengthOtherField, tapeLengthSelect.value === 'other');
    setVisible(tapeThicknessOtherField, tapeThicknessSelect.value === 'other');
    setVisible(tapeColorOtherField, tapeColorSelect.value === 'altul');
    setVisible(adhesiveOtherField, adhesiveSelect.value === 'altul');

    const printEnabled = printToggle.checked;
    setVisible(printFields, printEnabled);
    setVisible(printColorOtherField, printColorOtherToggle.checked && printEnabled);
    setVisible(printRepeatOtherField, printRepeatSelect.value === 'other');
    setVisible(printPositionOtherField, printPositionSelect.value === 'other');

    const hasLogo = logoInput.files && logoInput.files.length > 0;
    setVisible(noLogoField, printEnabled);
    if (!printEnabled) {
      noLogoLater.checked = false;
    }
    if (hasLogo) {
      noLogoLater.checked = false;
    }

    setVisible(packagingOtherField, packagingSelect.value === 'altul');
    setVisible(deadlineDateField, deadlineSelect.value === 'date');
    setVisible(paymentOtherField, paymentSelect.value === 'alta');

    updateVatInfo();
  }

  function updateVatInfo() {
    const type = getClientType();
    const cui = document.getElementById('cui').value.trim();
    if (type === 'firma' && cui) {
      vatInfo.textContent = 'TVA: firma cu CUI (se aplica conform legislatiei).';
      return;
    }
    if (type === 'firma') {
      vatInfo.textContent = 'TVA: firma (completeaza CUI pentru detalii).';
      return;
    }
    vatInfo.textContent = 'TVA: persoana fizica fara CUI.';
  }

  function updateColorCount() {
    const selectedColors = form.querySelectorAll('input[name="printColors"]:checked');
    const count = selectedColors.length;
    printColorCount.value = count ? String(count) : '';
    updateColorSummary();
  }

  function updateColorSummary() {
    if (!colorSummary) return;
    const printEnabled = printToggle.checked;
    colorSummary.hidden = !printEnabled;
    if (!printEnabled) {
      return;
    }
    const selectedColors = Array.from(form.querySelectorAll('input[name=\"printColors\"]:checked'));
    const count = selectedColors.length;
    const hasOther = printColorOtherToggle.checked;
    const otherText = document.getElementById('printColorOther').value.trim();
    const baseText = count === 0 ? 'Nu ai selectat nicio culoare.' : `Ai selectat: ${count} ${count === 1 ? 'culoare' : 'culori'}.`;
    const suffix = hasOther && otherText ? ` (+ alta: ${otherText})` : '';
    colorSummary.textContent = baseText + suffix;
  }

  function updateLogoMeta() {
    if (!logoInput.files || logoInput.files.length === 0) {
      logoFileMeta.textContent = 'Nu ai selectat niciun fisier. Max 10 MB.';
      return;
    }
    const file = logoInput.files[0];
    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    logoFileMeta.textContent = `${file.name} (${sizeMb} MB)`;
  }

  function updateDeliveryCityAuto() {
    if (!deliveryCityEdited) {
      deliveryCityInput.value = localityInput.value;
    }
  }

  function showStep(index) {
    currentStepIndex = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, idx) => {
      step.classList.toggle('is-active', idx === currentStepIndex);
      step.setAttribute('aria-current', idx === currentStepIndex ? 'step' : 'false');
    });
    stepItems.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === currentStepIndex);
      item.setAttribute('aria-current', idx === currentStepIndex ? 'step' : 'false');
    });
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    progressBar.style.width = `${progress}%`;
    prevBtn.disabled = currentStepIndex === 0;
    nextBtn.disabled = currentStepIndex === steps.length - 1;
    submitBtn.disabled = currentStepIndex !== steps.length - 1;
    if (currentStepIndex === steps.length - 1) {
      updateSummary();
    }
  }

  function setStatusMessage(message, type) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.hidden = false;
    statusMessage.classList.remove('is-success', 'is-error', 'is-info');
    if (type) {
      statusMessage.classList.add(`is-${type}`);
    }
  }

  function clearStatusMessage() {
    if (!statusMessage) return;
    statusMessage.hidden = true;
    statusMessage.textContent = '';
    statusMessage.classList.remove('is-success', 'is-error', 'is-info');
  }

  function setAutosaveStatus(message, hideAfterMs) {
    if (!autosaveStatus) return;
    autosaveStatus.textContent = message;
    autosaveStatus.hidden = false;
    clearTimeout(autosaveHideTimer);
    if (hideAfterMs) {
      autosaveHideTimer = setTimeout(() => {
        autosaveStatus.hidden = true;
      }, hideAfterMs);
    }
  }

  function setSubmitting(state) {
    if (!submitBtn) return;
    if (state) {
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = 'Se trimite...';
      submitBtn.disabled = true;
    } else {
      submitBtn.disabled = false;
      if (submitBtn.dataset.originalText) {
        submitBtn.textContent = submitBtn.dataset.originalText;
      }
    }
  }

  function getFieldLabel(element) {
    if (!element) return 'Camp';
    const field = element.closest('.field');
    if (!field) return 'Camp';
    const label = field.querySelector('label');
    return label ? label.textContent.trim() : 'Camp';
  }

  function addError(errors, element, message) {
    setError(element, message);
    const label = getFieldLabel(element);
    errors.push({ element, message: `${label}: ${message}` });
  }

  function addGroupError(errors, groupElement, label, message) {
    if (!groupElement) return;
    const errorEl = groupElement.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = message;
    }
    groupElement.classList.add('has-error');
    errors.push({ element: groupElement, message: `${label}: ${message}` });
  }

  function isEmpty(value) {
    return !value || !String(value).trim();
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 10;
  }

  function validateNumber(value, min, max) {
    if (isEmpty(value)) return false;
    const num = Number(value);
    if (Number.isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  }

  function fieldInScope(element, scope) {
    if (!element || !scope) return false;
    return scope.contains(element);
  }

  function validateScope(scope) {
    clearErrors(scope);
    const errors = [];
    const stepNumber = Number(scope.dataset.step || '0');
    const requiredIds = requiredByStep[stepNumber] || [];

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      if (field && fieldInScope(field, scope) && isEmpty(field.value)) {
        addError(errors, field, 'Camp obligatoriu.');
      }
    });

    if (stepNumber === 1) {
      const type = getClientType();
      const fullName = document.getElementById('fullName');
      const companyName = document.getElementById('companyName');
      const cui = document.getElementById('cui');
      const contactPerson = document.getElementById('contactPerson');
      const phone = document.getElementById('phone');
      const email = document.getElementById('email');
      const countyOther = document.getElementById('countyOther');
      const countyValue = countySelect ? countySelect.value.toLowerCase() : '';

      if (type === 'pf' && isEmpty(fullName.value)) {
        addError(errors, fullName, 'Camp obligatoriu pentru persoana fizica.');
      }
      if (type === 'firma') {
        if (isEmpty(companyName.value)) {
          addError(errors, companyName, 'Camp obligatoriu pentru firma.');
        }
        if (isEmpty(cui.value)) {
          addError(errors, cui, 'Camp obligatoriu pentru firma.');
        }
        if (isEmpty(contactPerson.value)) {
          addError(errors, contactPerson, 'Camp obligatoriu pentru firma.');
        }
      }
      if (!isEmpty(phone.value) && !validatePhone(phone.value)) {
        addError(errors, phone, 'Introdu minim 10 cifre.');
      }
      if (!isEmpty(email.value) && !validateEmail(email.value)) {
        addError(errors, email, 'Email invalid.');
      }
      if (countyValue === 'altul' && countyOther && isEmpty(countyOther.value)) {
        addError(errors, countyOther, 'Completeaza judetul.');
      }
    }

    if (stepNumber === 2) {
      const tapeTypeOther = document.getElementById('tapeTypeOther');
      if (tapeTypeSelect.value === 'altul' && isEmpty(tapeTypeOther.value)) {
        addError(errors, tapeTypeOther, 'Descriere obligatorie.');
      }
      const widthOther = document.getElementById('tapeWidthOther');
      if (tapeWidthSelect.value === 'other' && !validateNumber(widthOther.value, 5, 200)) {
        addError(errors, widthOther, 'Latime invalida (5-200 mm).');
      }
      const lengthOther = document.getElementById('tapeLengthOther');
      if (tapeLengthSelect.value === 'other' && !validateNumber(lengthOther.value, 30, 1000)) {
        addError(errors, lengthOther, 'Lungime invalida (30-1000 m).');
      }
      const thicknessOther = document.getElementById('tapeThicknessOther');
      if (tapeThicknessSelect.value === 'other' && !validateNumber(thicknessOther.value, 20, 100)) {
        addError(errors, thicknessOther, 'Grosime invalida (20-100 microni).');
      }
      const tapeColorOther = document.getElementById('tapeColorOther');
      if (tapeColorSelect.value === 'altul' && isEmpty(tapeColorOther.value)) {
        addError(errors, tapeColorOther, 'Descriere obligatorie.');
      }
      const adhesiveOther = document.getElementById('adhesiveOther');
      if (adhesiveSelect.value === 'altul' && isEmpty(adhesiveOther.value)) {
        addError(errors, adhesiveOther, 'Descriere obligatorie.');
      }
    }

    if (stepNumber === 3) {
      if (printToggle.checked) {
        if (isEmpty(printText.value)) {
          addError(errors, printText, 'Text obligatoriu pentru print.');
        }

        const selectedColors = Array.from(form.querySelectorAll('input[name="printColors"]:checked'));
        if (selectedColors.length === 0) {
          addGroupError(errors, document.getElementById('printColorsGroup'), 'Culori print', 'Selecteaza cel putin o culoare.');
        }

        if (printColorOtherToggle.checked) {
          const printColorOther = document.getElementById('printColorOther');
          if (isEmpty(printColorOther.value)) {
            addError(errors, printColorOther, 'Descriere obligatorie.');
          }
        }

        if (isEmpty(printRepeatSelect.value)) {
          addError(errors, printRepeatSelect, 'Selectie obligatorie.');
        } else if (printRepeatSelect.value === 'other') {
          const repeatOther = document.getElementById('printRepeatOther');
          if (!validateNumber(repeatOther.value, 10, 200)) {
            addError(errors, repeatOther, 'Repetitie invalida (10-200 cm).');
          }
        }

        if (isEmpty(printPositionSelect.value)) {
          addError(errors, printPositionSelect, 'Selectie obligatorie.');
        } else if (printPositionSelect.value === 'other') {
          const positionOther = document.getElementById('printPositionOther');
          if (isEmpty(positionOther.value)) {
            addError(errors, positionOther, 'Descriere obligatorie.');
          }
        }

        if (logoInput.files && logoInput.files.length > 0) {
          const file = logoInput.files[0];
          if (file.size > MAX_FILE_SIZE) {
            addError(errors, logoInput, 'Fisierul depaseste 10 MB.');
          }
        }

        if ((!logoInput.files || logoInput.files.length === 0) && !noLogoLater.checked) {
          addError(errors, noLogoLater, 'Selecteaza daca trimiti logo ulterior.');
        }
      }
    }

    if (stepNumber === 4) {
      const quantity = document.getElementById('quantity');
      if (!isEmpty(quantity.value) && !validateNumber(quantity.value, 36, null)) {
        addError(errors, quantity, 'Cantitatea minima este 36.');
      }
      const packagingOther = document.getElementById('packagingOther');
      if (packagingSelect.value === 'altul' && isEmpty(packagingOther.value)) {
        addError(errors, packagingOther, 'Descriere obligatorie.');
      }
      if (deadlineSelect.value === 'date') {
        const deadlineDate = document.getElementById('deadlineDate');
        if (isEmpty(deadlineDate.value)) {
          addError(errors, deadlineDate, 'Data obligatorie.');
        }
      }
    }

    if (stepNumber === 5) {
      const paymentOther = document.getElementById('paymentOther');
      if (paymentSelect.value === 'alta' && isEmpty(paymentOther.value)) {
        addError(errors, paymentOther, 'Descriere obligatorie.');
      }
    }

    return errors;
  }

  function renderErrorSummary(errors) {
    if (!errors.length) {
      errorSummary.hidden = true;
      errorList.innerHTML = '';
      return;
    }
    errorSummary.hidden = false;
    errorList.innerHTML = '';
    if (!errorSummary.hasAttribute('tabindex')) {
      errorSummary.setAttribute('tabindex', '-1');
    }
    errors.forEach((error) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'error-link';
      button.textContent = error.message;
      button.addEventListener('click', () => {
        const step = error.element.closest('.form-step');
        if (step) {
          const index = steps.indexOf(step);
          if (index >= 0) {
            showStep(index);
          }
        }
        if (error.element instanceof HTMLElement) {
          error.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (error.element.focus) {
            error.element.focus();
          }
        }
      });
      li.appendChild(button);
      errorList.appendChild(li);
    });
    errorSummary.focus();
  }

  function validateStep(index) {
    const step = steps[index];
    const errors = validateScope(step);
    renderErrorSummary(errors);
    return errors.length === 0;
  }

  function validateAll() {
    clearErrors();
    const errors = [];
    steps.forEach((step) => {
      const stepErrors = validateScope(step);
      errors.push(...stepErrors);
    });
    renderErrorSummary(errors);
    if (errors.length) {
      const firstStep = errors[0].element.closest('.form-step');
      if (firstStep) {
        const index = steps.indexOf(firstStep);
        if (index >= 0) {
          showStep(index);
        }
      }
    }
    return errors.length === 0;
  }

  function getBucharestParts() {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const map = {};
    parts.forEach((part) => {
      map[part.type] = part.value;
    });
    return map;
  }

  function generateRequestMeta() {
    const parts = getBucharestParts();
    const random = Math.floor(1000 + Math.random() * 9000);
    const requestId = `OF-${parts.year}${parts.month}${parts.day}-${random}`;
    requestIdInput.value = requestId;
    requestTimestampInput.value = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} (Europe/Bucharest)`;
  }

  function normalizeSelect(selectValue, otherValue, unit) {
    if (!selectValue) return '';
    const normalized = selectValue.toString();
    const normalizedLower = normalized.toLowerCase();
    if (normalizedLower === 'other' || normalizedLower === 'altul' || normalizedLower === 'alta' || normalizedLower === 'date') {
      if (isEmpty(otherValue)) return '';
      return unit ? `${otherValue} ${unit}` : otherValue;
    }
    if (unit && !String(selectValue).includes(unit)) {
      return `${normalized} ${unit}`;
    }
    return normalized;
  }

  function buildPayload() {
    const data = new FormData(form);
    const get = (name) => (data.get(name) || '').toString().trim();
    const getAll = (name) => data.getAll(name).map((val) => String(val)).filter(Boolean);

    const printEnabled = data.get('printEnabled') ? true : false;
    const colors = getAll('printColors');
    const files = logoInput.files ? Array.from(logoInput.files).map((file) => ({
      name: file.name,
      size: file.size
    })) : [];

    return {
      requestId: get('requestId'),
      createdAt: get('requestTimestamp'),
      client: {
        type: getClientType(),
        fullName: get('fullName'),
        companyName: get('companyName'),
        cui: get('cui'),
        regCom: get('regCom'),
        contactPerson: get('contactPerson'),
        phone: get('phone'),
        phoneDigits: get('phone').replace(/\D/g, ''),
        email: get('email'),
        locality: get('locality'),
        county: normalizeSelect(get('county'), get('countyOther'), ''),
        countyOther: get('countyOther'),
        country: get('country'),
        address: get('address'),
        addressNotes: get('addressNotes')
      },
      product: {
        tapeType: normalizeSelect(get('tapeType'), get('tapeTypeOther'), ''),
        width: normalizeSelect(get('tapeWidth'), get('tapeWidthOther'), 'mm'),
        length: normalizeSelect(get('tapeLength'), get('tapeLengthOther'), 'm'),
        thickness: normalizeSelect(get('tapeThickness'), get('tapeThicknessOther'), 'microni'),
        color: normalizeSelect(get('tapeColor'), get('tapeColorOther'), ''),
        adhesive: normalizeSelect(get('adhesiveType'), get('adhesiveOther'), '')
      },
      print: {
        enabled: printEnabled,
        text: get('printText'),
        colors,
        colorOther: get('printColorOther'),
        colorCount: get('printColorCount'),
        repeat: normalizeSelect(get('printRepeat'), get('printRepeatOther'), 'cm'),
        position: normalizeSelect(get('printPosition'), get('printPositionOther'), ''),
        noLogoLater: data.get('noLogoLater') ? true : false
      },
      quantity: {
        rolls: get('quantity'),
        packaging: normalizeSelect(get('packaging'), get('packagingOther'), ''),
        deadline: normalizeSelect(get('deadline'), get('deadlineDate'), '')
      },
      delivery: {
        method: get('deliveryMethod'),
        city: get('deliveryCity'),
        payment: normalizeSelect(get('payment'), get('paymentOther'), ''),
        vatInfo: vatInfo.textContent
      },
      files,
      meta: {
        userAgent: navigator.userAgent,
        page: window.location.href
      }
    };
  }

  function buildSummaryBlocks(payload) {
    const printEnabled = payload.print.enabled;
    const printColors = payload.print.colors.filter((color) => color !== 'alta');
    if (payload.print.colorOther) {
      printColors.push(payload.print.colorOther);
    }
    return [
      {
        title: 'Client',
        items: [
          ['Tip client', payload.client.type === 'firma' ? 'Firma' : 'Persoana fizica'],
          ['Nume', payload.client.fullName || '-'],
          ['Firma', payload.client.companyName || '-'],
          ['CUI', payload.client.cui || '-'],
          ['Contact', payload.client.contactPerson || '-'],
          ['Telefon', payload.client.phone || '-'],
          ['Email', payload.client.email || '-'],
          ['Localitate', payload.client.locality || '-'],
          ['Judet', payload.client.county || '-']
        ]
      },
      {
        title: 'Produs',
        items: [
          ['Tip scoci', payload.product.tapeType || '-'],
          ['Latime', payload.product.width || '-'],
          ['Lungime', payload.product.length || '-'],
          ['Grosime', payload.product.thickness || '-'],
          ['Culoare', payload.product.color || '-'],
          ['Adeziv', payload.product.adhesive || '-']
        ]
      },
      {
        title: 'Print',
        items: [
          ['Print', printEnabled ? 'Da' : 'Nu'],
          ['Text', printEnabled ? (payload.print.text || '-') : '-'],
          ['Culori', printEnabled && printColors.length ? printColors.join(', ') : '-'],
          ['Repetitie', printEnabled ? (payload.print.repeat || '-') : '-'],
          ['Pozitionare', printEnabled ? (payload.print.position || '-') : '-']
        ]
      },
      {
        title: 'Cantitate',
        items: [
          ['Role', payload.quantity.rolls || '-'],
          ['Ambalare', payload.quantity.packaging || '-'],
          ['Termen', payload.quantity.deadline || '-']
        ]
      },
      {
        title: 'Livrare',
        items: [
          ['Metoda', payload.delivery.method || '-'],
          ['Oras', payload.delivery.city || '-'],
          ['Plata', payload.delivery.payment || '-'],
          ['TVA', payload.delivery.vatInfo || '-']
        ]
      }
    ];
  }

  function updateSummary() {
    const payload = buildPayload();
    const blocks = buildSummaryBlocks(payload);
    const html = blocks.map((block) => {
      const items = block.items.map((item) => `<div><strong>${escapeHtml(item[0])}:</strong> ${escapeHtml(item[1])}</div>`).join('');
      return `<div class="summary-block"><strong>${escapeHtml(block.title)}</strong><div class="summary-lines">${items}</div></div>`;
    }).join('');
    summaryContent.innerHTML = html || 'Completeaza campurile pentru a vedea rezumatul.';
  }

  function openPreview() {
    const payload = buildPayload();
    const blocks = buildSummaryBlocks(payload);
    const files = payload.files.length ? payload.files.map((file) => escapeHtml(file.name)).join(', ') : 'Niciun fisier incarcat';

    const sections = blocks.map((block) => {
      const list = block.items.map((item) => `<div>${escapeHtml(item[0])}: <strong>${escapeHtml(item[1])}</strong></div>`).join('');
      return `<div class="preview-block"><h4>${escapeHtml(block.title)}</h4><div class="preview-list">${list}</div></div>`;
    }).join('');

    previewContent.innerHTML = `
      <div class="preview-block">
        <h4>Detalii cerere</h4>
        <div class="preview-list">
          <div>Numar cerere: <strong>${escapeHtml(payload.requestId)}</strong></div>
          <div>Data si ora: <strong>${escapeHtml(payload.createdAt)}</strong></div>
        </div>
      </div>
      ${sections}
      <div class="preview-block">
        <h4>Fisiere atasate</h4>
        <div class="preview-list">${files}</div>
      </div>
    `;

    previewModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePreview() {
    previewModal.hidden = true;
    document.body.style.overflow = '';
  }

  function saveToStorage() {
    setAutosaveStatus('Se salveaza...', null);
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      if (!field.name) return;
      if (field.type === 'checkbox') {
        if (field.name === 'printColors') {
          data.printColors = data.printColors || [];
          if (field.checked) {
            data.printColors.push(field.value);
          }
        } else {
          data[field.name] = field.checked;
        }
        return;
      }
      if (field.type === 'radio') {
        if (field.checked) {
          data[field.name] = field.value;
        }
        return;
      }
      if (field.type === 'file') {
        data[field.name] = field.files && field.files.length ? Array.from(field.files).map((file) => file.name) : [];
        return;
      }
      data[field.name] = field.value;
    });
    data._step = currentStepIndex;
    data._deliveryCityEdited = deliveryCityEdited;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const original = saveBtn.textContent;
    saveBtn.textContent = 'Salvat';
    setTimeout(() => {
      saveBtn.textContent = original;
    }, 1200);
    setAutosaveStatus('Salvat', 1800);
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const data = JSON.parse(raw);
      form.querySelectorAll('input, select, textarea').forEach((field) => {
        if (!field.name || data[field.name] === undefined) return;
        if (field.type === 'checkbox') {
          if (field.name === 'printColors') {
            field.checked = Array.isArray(data.printColors) && data.printColors.includes(field.value);
          } else {
            field.checked = Boolean(data[field.name]);
          }
          return;
        }
        if (field.type === 'radio') {
          field.checked = data[field.name] === field.value;
          return;
        }
        if (field.type === 'file') {
          return;
        }
        field.value = data[field.name];
      });
      if (typeof data._step === 'number') {
        currentStepIndex = Math.min(steps.length - 1, Math.max(0, data._step));
      }
      deliveryCityEdited = Boolean(data._deliveryCityEdited);
    } catch (error) {
      setAutosaveStatus('Datele salvate local nu au putut fi citite. Am resetat formularul.', 3600);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function resetForm() {
    if (!confirm('Sigur vrei sa stergi toate datele?')) {
      return;
    }
    form.reset();
    localStorage.removeItem(STORAGE_KEY);
    deliveryCityEdited = false;
    generateRequestMeta();
    updateConditional();
    updateColorCount();
    updateLogoMeta();
    showStep(0);
    renderErrorSummary([]);
    clearStatusMessage();
  }

  function scheduleAutoSave() {
    clearTimeout(saveTimer);
    setAutosaveStatus('Se salveaza...', null);
    saveTimer = setTimeout(() => {
      saveToStorage();
    }, 500);
  }

  async function submitForm() {
    if (isSubmitting) return;
    isSubmitting = true;
    const payload = buildPayload();
    const formData = new FormData(form);
    formData.set('payload', JSON.stringify(payload));

    clearStatusMessage();
    setSubmitting(true);
    setStatusMessage('Se trimite...', 'info');

    let responseBody;
    let succeeded = false;
    try {
      const endpoint = new URL('/api/oferta/index.php', window.location.origin);
      const response = await fetch(endpoint.toString(), {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const success = response.ok && responseBody && responseBody.success === true;
      if (!success) {
        const message = (responseBody && responseBody.error) || response.statusText || 'Eroare la trimitere';
        throw new Error(message);
      }

      const requestId = (responseBody && responseBody.requestId) || payload.requestId;
      setStatusMessage(`Cererea a fost trimisa cu succes.${requestId ? ` Numar cerere: ${requestId}.` : ''}`, 'success');
      localStorage.removeItem(STORAGE_KEY);
      succeeded = true;
    } catch (error) {
      const reason = error && error.message ? error.message : 'necunoscuta';
      setStatusMessage(`Eroare la trimitere: ${reason}`, 'error');
      isSubmitting = false;
      setSubmitting(false);
    } finally {
      if (!succeeded) {
        isSubmitting = false;
      }
    }
  }

  function attachListeners() {
    function handleStepActivate(targetIndex) {
      if (targetIndex === currentStepIndex) return;
      if (targetIndex < currentStepIndex) {
        showStep(targetIndex);
        return;
      }
      if (validateStep(currentStepIndex)) {
        showStep(targetIndex);
      }
    }

    stepItems.forEach((item, idx) => {
      if (!item.getAttribute('aria-label') && item.dataset.stepLabel) {
        item.setAttribute('aria-label', item.dataset.stepLabel);
      }
      item.addEventListener('click', () => handleStepActivate(idx));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleStepActivate(idx);
        }
      });
    });

    clientTypeRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        updateConditional();
        updateVatInfo();
        scheduleAutoSave();
      });
    });

    [tapeTypeSelect, tapeWidthSelect, tapeLengthSelect, tapeThicknessSelect, tapeColorSelect, adhesiveSelect,
      printToggle, printColorOtherToggle, printRepeatSelect, printPositionSelect, packagingSelect, deadlineSelect, paymentSelect, countySelect]
      .forEach((el) => {
        if (!el) return;
        el.addEventListener('change', () => {
          updateConditional();
          updateColorCount();
          scheduleAutoSave();
        });
      });

    form.addEventListener('input', (event) => {
      if (event.target === localityInput) {
        updateDeliveryCityAuto();
      }
      if (event.target === deliveryCityInput) {
        deliveryCityEdited = deliveryCityInput.value.trim() !== localityInput.value.trim();
      }
      if (event.target.name === 'printColors') {
        updateColorCount();
      }
      if (event.target.id === 'printColorOther') {
        updateColorSummary();
      }
      scheduleAutoSave();
      if (currentStepIndex === steps.length - 1) {
        updateSummary();
      }
    });

    logoInput.addEventListener('change', () => {
      updateLogoMeta();
      updateConditional();
      scheduleAutoSave();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showStep(currentStepIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateStep(currentStepIndex)) {
          showStep(currentStepIndex + 1);
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveToStorage();
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        if (validateAll()) {
          openPreview();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetForm);
    }

    if (previewClose) {
      previewClose.addEventListener('click', closePreview);
    }
    if (previewModal) {
      previewModal.addEventListener('click', (event) => {
        if (event.target === previewModal) {
          closePreview();
        }
      });
    }

    if (previewPrint) {
      previewPrint.addEventListener('click', () => {
        window.print();
      });
    }

    if (previewSubmit) {
      previewSubmit.addEventListener('click', () => {
        closePreview();
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateAll()) {
        return;
      }
      submitForm();
    });
  }

  function init() {
    generateRequestMeta();
    loadFromStorage();
    updateConditional();
    updateColorCount();
    updateLogoMeta();
    updateDeliveryCityAuto();
    showStep(currentStepIndex);
    updateSummary();
    attachListeners();
  }

  init();
})();
