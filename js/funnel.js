/* Shared inquiry and homepage behavior. No personal form data is stored in the browser. */
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  const closeMenu = (restoreFocus = false) => {
    if (!menu || !menuButton) return;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = 'Menu <span aria-hidden="true">+</span>';
    if (restoreFocus) menuButton.focus();
  };
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.innerHTML = open ? 'Close <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">+</span>';
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    window.matchMedia('(min-width: 901px)').addEventListener('change', () => closeMenu());
  }

  const players = [...document.querySelectorAll('audio')];
  players.forEach(player => player.addEventListener('play', () => {
    players.forEach(other => { if (other !== player) other.pause(); });
  }));

  // Preserve campaign labels across the homepage -> inquiry path.
  // Do not store query strings, click identifiers, or contact/project fields.
  const query = new URLSearchParams(window.location.search);
  const campaignFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  let campaign = {};
  const cleanCampaign = value => typeof value === 'string' ? value.trim().slice(0, 150) : '';
  try {
    if (campaignFields.some(key => query.has(key))) {
      campaignFields.forEach(key => {
        if (query.get(key)) campaign[key] = cleanCampaign(query.get(key));
      });
      sessionStorage.setItem('deric-campaign', JSON.stringify(campaign));
    } else {
      const saved = JSON.parse(sessionStorage.getItem('deric-campaign') || '{}');
      campaignFields.forEach(key => {
        if (typeof saved?.[key] === 'string') campaign[key] = cleanCampaign(saved[key]);
      });
    }
  } catch (_) { /* Inquiries still work if browser storage is disabled. */ }

  const form = document.getElementById('project-form');
  if (!form) return;
  form.noValidate = true;
  const project = document.getElementById('step-project');
  const contact = document.getElementById('step-contact');
  const next = document.getElementById('inquiry-next');
  const back = document.getElementById('inquiry-back');
  const send = document.getElementById('inquiry-send');
  const status = document.getElementById('inquiry-status');
  const progressProject = document.getElementById('progress-project');
  const progressContact = document.getElementById('progress-contact');
  const endpoint = window.DERIC_INQUIRY_CONFIG?.endpoint || '';
  const connected = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
  let sending = false;
  let completed = false;
  const originalSendLabel = send.innerHTML;
  const inquiryId = 'lead-' + (window.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12));
  if (!connected) {
    document.getElementById('inquiry-unavailable').hidden = false;
    send.disabled = true;
    send.textContent = 'Preview only';
  } else {
    form.action = endpoint;
  }
  // Extend this list only when a future service is ready to accept inquiries.
  const serviceKeys = ['writing', 'vocals', 'custom', 'unsure'];
  const preferred = query.get('need');
  if (serviceKeys.includes(preferred)) form.querySelector('input[value="' + preferred + '"]').checked = true;

  const packages = {
    'custom-hook': { name: 'Custom Hook', service: 'writing' },
    'full-songwriting': { name: 'Full Songwriting', service: 'writing' },
    'full-record': { name: 'Full Record', service: 'vocals' },
    'feature': { name: 'Feature / Custom Verse', service: 'vocals' }
  };
  const packageField = document.getElementById('package-field');
  const packageChoice = document.getElementById('package-choice');
  const packageSummary = document.getElementById('package-summary');
  function selectedPackage() {
    const key = packageChoice?.value || '';
    const choice = Object.hasOwn(packages, key) ? packages[key] : null;
    const service = form.querySelector('[name="service"]:checked')?.value;
    return choice?.service === service ? { key, ...choice } : null;
  }
  function updatePackageSummary() {
    if (!packageSummary) return;
    const choice = selectedPackage();
    packageSummary.hidden = !choice;
    packageSummary.textContent = choice ? 'You’re asking about: ' + choice.name : '';
  }
  function updatePackages(requested = '') {
    if (!packageField || !packageChoice) return;
    const service = form.querySelector('[name="service"]:checked')?.value;
    const current = requested || packageChoice.value;
    const choices = Object.entries(packages).filter(([, value]) => value.service === service);
    packageField.hidden = choices.length === 0;
    packageChoice.disabled = choices.length === 0;
    packageChoice.replaceChildren(new Option('Help Me Choose', ''));
    choices.forEach(([key, value]) => packageChoice.add(new Option(value.name, key)));
    packageChoice.value = choices.some(([key]) => key === current) ? current : '';
    updatePackageSummary();
  }
  const requestedPackage = query.get('package') || '';
  if (Object.hasOwn(packages, requestedPackage)) {
    form.querySelector('[name="service"][value="' + packages[requestedPackage].service + '"]').checked = true;
  }
  updatePackages(requestedPackage);
  form.querySelectorAll('[name="service"]').forEach(input => input.addEventListener('change', () => updatePackages()));
  packageChoice?.addEventListener('change', updatePackageSummary);

  function showStep(step) {
    const first = step === 1;
    project.hidden = !first;
    contact.hidden = first;
    contact.disabled = first;
    progressProject.toggleAttribute('aria-current', first);
    progressContact.toggleAttribute('aria-current', !first);
    (first ? progressProject : progressContact).setAttribute('aria-current', 'step');
    (first ? project : contact).querySelector('legend').focus();
    status.textContent = '';
  }
  function validFields(group, report = true) {
    for (const field of group.querySelectorAll('input,textarea,select')) {
      if (field.required && (field.type === 'text' || field.tagName === 'TEXTAREA')) {
        field.setCustomValidity(field.value.trim() ? '' : 'Please enter a few details here.');
      }
      if (!field.checkValidity()) { if (report) field.reportValidity(); return false; }
    }
    return true;
  }
  next.addEventListener('click', () => { if (validFields(project)) showStep(2); });
  back.addEventListener('click', () => showStep(1));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || completed) return;
    if (!validFields(project, false)) { showStep(1); validFields(project); return; }
    if (contact.hidden) { showStep(2); return; }
    if (!validFields(contact)) return;
    if (!connected) {
      status.textContent = 'This is a preview. Nothing has been sent or saved. Email contact@dericmusic.com for a real inquiry.';
      return;
    }
    if (form.elements._gotcha.value) return;
    sending = true;
    send.disabled = true;
    back.disabled = true;
    send.textContent = 'Sending…';
    status.textContent = 'Sending your project details…';
    const data = new FormData(form);
    const budgetField = form.elements.budget;
    if (budgetField?.value) data.set('budget', budgetField.selectedOptions[0].textContent);
    Object.entries(campaign).forEach(([key, value]) => data.set(key, value));
    data.set('source_page', window.location.pathname);
    data.set('_subject', 'New service inquiry | Deric Music');
    data.set('inquiry_type', 'service_project');
    data.set('inquiry_id', inquiryId);
    const packageSelection = selectedPackage();
    data.delete('package');
    if (packageSelection) {
      data.set('package_key', packageSelection.key);
      data.set('package_name', packageSelection.name);
      data.set('_subject', packageSelection.name + ' inquiry | Deric Music');
    }
    if (!data.get('utm_source')) data.set('utm_source', 'direct_or_unattributed');
    try {
      const referringHost = document.referrer ? new URL(document.referrer).hostname : '';
      if (referringHost && referringHost !== window.location.hostname) data.set('referral_host', referringHost);
    } catch (_) { /* Referral information is optional. */ }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error('Submission not confirmed');
      completed = true;
      form.hidden = true;
      const success = document.getElementById('inquiry-success');
      const reference = document.getElementById('inquiry-reference');
      if (reference) {
        reference.textContent = inquiryId;
        reference.parentElement.hidden = false;
      }
      const followUp = document.getElementById('inquiry-follow-up-link');
      if (followUp) {
        const subject = 'Follow-up on ' + inquiryId + ' | Deric Music';
        followUp.href = 'mailto:contact@dericmusic.com?subject=' + encodeURIComponent(subject);
      }
      success.hidden = false;
      success.focus();
      form.reset();
      // Local hook for future consent-aware conversion tracking. Contains no personal details.
      window.dispatchEvent(new CustomEvent('deric:inquiry-sent', { detail: { service: data.get('service'), packageKey: packageSelection?.key || '', inquiryId } }));
    } catch (_) {
      status.textContent = 'We couldn’t confirm delivery. Your details are still here. You can try again or email contact@dericmusic.com.';
      status.focus();
    } finally {
      clearTimeout(timer);
      sending = false;
      send.disabled = !connected;
      back.disabled = false;
      send.innerHTML = originalSendLabel;
    }
  });
});
