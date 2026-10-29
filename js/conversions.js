/* Conversion tags load only with visitor permission, on the configured production host.
   Contact/project fields are never included. Preview traffic does not load vendor tags. */
document.addEventListener('DOMContentLoaded', () => {
  const config = window.DERIC_TRACKING_CONFIG || {};
  const onProduction = (config.productionHosts || []).includes(location.hostname);
  const ga4Id = /^G-[A-Z0-9]+$/.test(config.ga4Id || '') ? config.ga4Id : '';
  const pixelId = /^\d{6,25}$/.test(config.metaPixelId || '') ? config.metaPixelId : '';
  const available = onProduction && Boolean(ga4Id || pixelId);
  const preferenceKey = 'deric-measurement-v1';
  const protectedBrowser = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let consent = false;
  let started = false;
  const counted = new Set();
  try { consent = JSON.parse(localStorage.getItem(preferenceKey) || 'null')?.allowed === true; } catch (_) {}
  if (protectedBrowser) consent = false;
  function start() {
    if (!available || !consent || started) return;
    started = true;
    if (ga4Id) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('js', new Date());
      window.gtag('config', ga4Id, {send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
      window.gtag('event', 'page_view', {page_location:location.origin + location.pathname,page_referrer:document.referrer ? new URL(document.referrer).origin : '',page_title:document.title});
      const tag = document.createElement('script');
      tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga4Id;
      document.head.append(tag);
    }
    if (pixelId) {
      const fbq = window.fbq = window.fbq || function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = fbq.queue || [];
      fbq('consent', 'grant');
      fbq('set', 'autoConfig', false, pixelId);
      fbq('init', pixelId);
      fbq('track', 'PageView');
      const tag = document.createElement('script');
      tag.async = true; tag.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.append(tag);
    }
  }
  function storePreference(allowed) {
    consent = allowed && !protectedBrowser;
    try { localStorage.setItem(preferenceKey, JSON.stringify({allowed:consent,updated:new Date().toISOString()})); } catch (_) {}
    if (consent) {
      if (started) {
        window.gtag?.('consent', 'update', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
        window.fbq?.('consent', 'grant');
      }
      start();
    }
    else {
      window.gtag?.('consent', 'update', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.fbq?.('consent', 'revoke');
    }
  }
  document.querySelectorAll('[data-tracking-settings]').forEach(button => {
    button.hidden = !available || protectedBrowser;
    button.addEventListener('click', () => openPreferences());
  });
  function openPreferences() {
    let dialog = document.getElementById('measurement-preferences');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'measurement-preferences'; dialog.className = 'tracking-dialog';
      dialog.setAttribute('aria-labelledby', 'measurement-title');
      dialog.innerHTML = '<h2 id="measurement-title">Measurement preferences</h2><p>Optional analytics and advertising tools help me understand which visits turn into inquiries. Your name, email, and project details are not sent in conversion events.</p><p>Your inquiry works either way. <a href="privacy.html">Read the privacy details</a>.</p><div class="form-actions"><button type="button" class="button button-secondary" data-measure="no">Essential only</button><button type="button" class="button" data-measure="yes">Allow measurement</button></div>';
      document.body.append(dialog);
      dialog.querySelectorAll('[data-measure]').forEach(button=>button.addEventListener('click',()=>{ storePreference(button.dataset.measure==='yes'); dialog.close(); }));
      dialog.addEventListener('cancel',()=>storePreference(false));
    }
    dialog.showModal();
  }
  let saved = false;
  try { saved = localStorage.getItem(preferenceKey) !== null; } catch (_) {}
  if (available && !saved && !protectedBrowser) openPreferences();
  start();
  window.addEventListener('deric:inquiry-sent', event => {
    const {service, packageKey, inquiryId} = event.detail || {};
    if (!available || !consent || !['writing','vocals','custom','unsure'].includes(service) || !/^lead-[a-zA-Z0-9-]{8,80}$/.test(inquiryId || '') || counted.has(inquiryId)) return;
    counted.add(inquiryId);
    start();
    const packageServices = {'custom-hook':'writing','full-songwriting':'writing','full-record':'vocals','feature':'vocals'};
    const matchedPackage = Object.hasOwn(packageServices, packageKey || '') && packageServices[packageKey] === service ? packageKey : '';
    const googleDetails = {service_category:service,lead_source:'website_inquiry'};
    const metaDetails = {content_category:service};
    if (matchedPackage) { googleDetails.service_package = matchedPackage; metaDetails.content_name = matchedPackage; }
    if (ga4Id) window.gtag('event', 'generate_lead', googleDetails);
    if (pixelId) window.fbq('track', 'Lead', metaDetails, {eventID:inquiryId});
  });
});
