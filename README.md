# Deric Music service site

Static site for service.dericmusic.com. GitHub Pages publishes the main branch.

The funnel is homepage → music/client proof → service inquiry → agree project details → Stripe booking. Existing prices and four checkout URLs are preserved. Direct checkout remains in an expandable booking section for people who already agreed on a project.

## Lead delivery

`js/inquiry-config.js` contains the public Formspree endpoint used by the existing dericmusic.com contact form. It sends to the verified info@dericmusic.com address, delivered into the contact@dericmusic.com music inbox. No API secret is stored in site code. Two marked tests were received on October 29, 2026 UTC, including one through the actual two-step form logic.

Each inquiry contains a unique reference, selected service, project and contact fields, optional budget/deadline/music/social fields, submitting page, optional referral domain, and campaign tags. The form preserves entered details on failure and suppresses repeated submissions. It does not subscribe people to MailerLite.

## Campaign attribution and conversions

Use campaign-tagged ad URLs, for example:

`https://service.dericmusic.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=custom_hooks`

Standard UTM fields are carried between pages in session storage and included in inquiry emails. Unattributed inquiries are labelled direct_or_unattributed. Submission counts by campaign are available from the inquiry records; email attribution alone does not calculate visit-to-lead conversion rates or optimize an ad platform.

`js/tracking-config.js` accepts a public GA4 measurement ID and/or Meta Pixel ID. Both are currently blank, so no Google or Meta measurement tag is active. Once IDs are connected, tags run only on service.dericmusic.com after the visitor allows measurement. GPC and Do Not Track disable these optional tags. Conversion events exclude contact/project text. GA4 uses generate_lead; Meta uses Lead with an inquiry reference as event ID. Events fire only after Formspree confirms acceptance. No purchase event or revenue value is fabricated.

To finish account reporting, connect the correct ID, verify a real event in the provider dashboard, mark generate_lead as a GA4 key event or Lead as the intended Meta conversion, and connect it to the relevant ads account. Update privacy.html when tags are activated. Account ID and dashboard access are still needed.

## Mobile and validation

The homepage has a compact photo-backed mobile hero. Custom play/pause and seek controls enhance native audio; native controls remain if JavaScript is unavailable. One track plays at a time, with a direct audio link on playback errors.

17 automated DOM/behavior checks cover navigation, local routes, form validation and budget choices, submission outcomes/duplicates, audio controls, and consent-gated conversions. Live Formspree acceptance and inbox receipt were verified. No payment was made. Rendered desktop/iPhone QA remains pending because local browser access was disabled. Real analytics-provider verification also remains pending.
