# FINALIZE.md

# Production Release Checklist
# Stack: Jekyll · TailwindCSS · CloudCannon CMS · Netlify Forms · Netlify Functions/Edge · Third-Party APIs

This document defines the mandatory final validation process before a project can be marked as production-ready.

---

# Purpose

Ensure:

* Production build stability
* TailwindCSS purge correctness
* CloudCannon CMS editability
* Netlify Forms, Functions, and Edge correctness
* Third-party API integration safety
* HTTP security headers and CSP compliance
* Dependency and secrets vulnerability hygiene
* Form spam and bot protection
* SEO readiness
* Accessibility compliance (WCAG 2.1 AA)
* Performance optimization
* Zero deployment blockers

No deployment should proceed until this checklist is fully executed.

---

# Required Workflow

Execute all phases in order. Do not skip any phase.

1. Final Build Validation
2. TailwindCSS Validation
3. Security Validation
4. Dependency & Secrets Audit
5. Netlify Forms Validation
6. Netlify Functions & Edge Validation
7. Third-Party API Validation
8. CloudCannon CMS Validation
9. SEO Validation
10. Accessibility Validation
11. Performance Validation
12. Netlify Platform Validation
13. Production Risk Review
14. Final Report Generation

---

# Phase 1: Final Build Validation

## Jekyll Build

Run:

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

Expected:

```text
Build successful
Exit code: 0
```

Verify:

* No fatal build errors
* No unresolved Liquid tags or filters
* No missing layouts or includes
* No broken front matter (malformed YAML)
* No missing assets referenced in templates
* No orphaned pages (pages with no layout assigned)
* No missing collections referenced in `_config.yml`
* `_site/` directory generated and populated

Verify `_config.yml` production settings:

```yaml
JEKYLL_ENV: production
url: "https://yourdomain.com"   # Must be set; affects canonical URLs and sitemap
baseurl: ""                      # Confirm correct for deployment path
```

Check for Jekyll deprecation warnings in build output. Log any warnings even if build passes.

If build fails:

**STOP. Create blocker report. Do not continue.**

---

# Phase 2: TailwindCSS Validation

## Purge / Content Scanning

Verify `tailwind.config.js` content paths cover all template sources:

```js
content: [
  './_layouts/**/*.html',
  './_includes/**/*.html',
  './_pages/**/*.html',
  './_posts/**/*.html',
  './_data/**/*.yml',
  './assets/js/**/*.js',
]
```

Check:

* No legitimate utility classes stripped from production CSS
* Dynamically constructed class names (e.g. `text-${color}-500`) are safelisted
* Safelist in config covers all runtime-dynamic classes:

```js
safelist: [
  'bg-red-500',
  { pattern: /^text-(sm|md|lg)$/ },
]
```

## CSS Output

Verify:

* Production CSS file size is reasonable (target under 20KB gzipped for typical sites)
* No critical styles missing from rendered pages
* No layout breakage on mobile, tablet, or desktop viewports
* Dark mode classes (if used) render correctly

Run build and inspect output:

```bash
ls -lh _site/assets/css/
```

## Custom CSS / Plugins

Verify:

* No `@apply` directives reference purged utilities
* PostCSS plugins (autoprefixer, cssnano) applied correctly
* No vendor prefix issues on target browsers

---

# Phase 3: Security Validation

This phase is mandatory. All critical security issues block deployment.

## 3.1 HTTP Security Headers

Verify headers are set in `netlify.toml` under `[[headers]]` for all routes (`/*`).

Required headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

Verify HSTS:

* `max-age` is at minimum 31536000 (1 year)
* `includeSubDomains` present
* `preload` present if submitting to HSTS preload list

## 3.2 Content Security Policy (CSP)

Build a strict CSP. Start from a deny-all baseline and add only required sources.

Example production CSP:

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.yourservice.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests;"
```

Verify:

* `default-src 'self'` as baseline
* No `unsafe-eval` unless absolutely required (document exception if present)
* `unsafe-inline` for scripts must be replaced with hashes or nonces if possible
* All third-party domains explicitly listed (analytics, fonts, APIs, CDNs)
* `frame-ancestors 'none'` or `frame-ancestors 'self'` set
* `upgrade-insecure-requests` present
* `form-action` restricted to `'self'` unless forms post to external services

Test CSP with browser DevTools console during smoke testing. Zero CSP violations permitted in production.

## 3.3 Mixed Content

Verify:

* All asset URLs use HTTPS
* No `http://` references in templates, CSS, or JavaScript
* No protocol-relative URLs (`//`) that could resolve to HTTP in edge cases
* Netlify `upgrade-insecure-requests` directive applied

Search for HTTP references:

```bash
grep -r "http://" _site/ --include="*.html" --include="*.css" --include="*.js"
```

Expected: no results pointing to external resources over HTTP.

## 3.4 Clickjacking and Iframe Protection

Verify:

* `X-Frame-Options: DENY` set (or `SAMEORIGIN` if iframes are used internally)
* CSP `frame-ancestors` directive matches `X-Frame-Options` policy

## 3.5 Third-Party Script Risk

For every third-party script loaded (analytics, chat widgets, ad pixels, etc.):

Verify:

* Source domain is listed in CSP `script-src`
* Script loaded from a pinned version URL where possible (not `latest`)
* Subresource Integrity (SRI) hash applied to scripts loaded from external CDNs:

```html
<script
  src="https://cdn.example.com/lib.min.js"
  integrity="sha384-HASH"
  crossorigin="anonymous">
</script>
```

Generate SRI hashes:

```bash
openssl dgst -sha384 -binary FILE | openssl base64 -A
```

Or use: https://www.srihash.org

Verify:

* All third-party scripts evaluated for data collection practices
* Scripts that set cookies documented and included in cookie/privacy policy
* No scripts loaded from unknown or unverified CDNs

---

# Phase 4: Dependency & Secrets Audit

## 4.1 Ruby / Bundler Dependency Audit

Run:

```bash
bundle audit check --update
```

If `bundler-audit` not installed:

```bash
gem install bundler-audit
```

Verify:

* No known CVEs in gem dependencies
* All gems pinned to specific versions in `Gemfile.lock`
* `Gemfile.lock` committed to version control

Address all HIGH and CRITICAL CVEs before deployment. Document any accepted LOW/MEDIUM risks.

## 4.2 Node / npm Dependency Audit

If the project uses Node for Tailwind or other tooling:

```bash
npm audit --audit-level=high
```

Verify:

* No HIGH or CRITICAL vulnerabilities in production dependencies
* `package-lock.json` committed to version control

Note: dev-only vulnerabilities (tools not bundled into `_site/`) are lower priority but should still be tracked.

## 4.3 Secrets and Environment Variable Audit

Verify no secrets are committed to the repository:

```bash
git log --all --full-history -- "**/*.env"
git grep -i "api_key\|secret\|password\|token\|private_key" -- '*.yml' '*.yaml' '*.js' '*.rb' '*.json' '*.toml'
```

Verify:

* `.env` files are listed in `.gitignore`
* No API keys, tokens, or passwords in `_config.yml`, `netlify.toml`, or any committed file
* All secrets stored in Netlify Environment Variables UI (not in config files)
* No secrets in Jekyll front matter or `_data/` files
* No secrets in JavaScript files bundled into `_site/`

Verify `_config.yml` does not expose sensitive values:

```bash
grep -i "key\|secret\|token\|password\|auth" _config.yml
```

Verify Netlify environment variables:

* All variables used in Functions or build hooks exist in Netlify UI
* No unused variables remaining
* Variable names follow a consistent naming convention (`SITE_`, `API_`, etc.)
* Rotate any secrets that may have been accidentally exposed in git history

## 4.4 Git History Secrets Scan

```bash
git log --all -p | grep -i "api_key\|secret\|password\|token" | head -50
```

If any secrets found in history: rotate immediately and use `git filter-repo` to purge.

---

# Phase 5: Netlify Forms Validation

## 5.1 Form Detection

Verify each HTML form has Netlify detection attributes:

```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  ...
</form>
```

Verify:

* `data-netlify="true"` present on every form
* `name` attribute unique per form
* Hidden `form-name` input matches form `name`
* `method="POST"` set

## 5.2 Spam and Bot Protection

Every form must include bot protection. Choose one or combine:

**Honeypot (minimum required):**

```html
<p class="hidden" aria-hidden="true">
  <label>Don't fill this out: <input name="bot-field" /></label>
</p>
```

```html
<form netlify-honeypot="bot-field" ...>
```

Hide the honeypot with CSS (not `display:none` — use a visually-hidden class):

```css
.hidden { position: absolute; left: -9999px; }
```

**reCAPTCHA v3 or hCaptcha (recommended for high-traffic forms):**

```html
<div data-netlify-recaptcha="true"></div>
```

Verify:

* Honeypot present on all forms as baseline
* CAPTCHA added to any form that handles sensitive data, account creation, or file uploads
* Bot protection tested end-to-end in deploy preview before production

## 5.3 Form Submission Testing

Test each form in Netlify deploy preview:

* Submit with valid data → confirm submission appears in Netlify Forms dashboard
* Submit with honeypot field filled → confirm submission blocked
* Submit with empty required fields → confirm client-side and/or server-side validation triggers
* Verify success/error redirect URLs work correctly

## 5.4 Form Notifications

Verify:

* Email notifications configured in Netlify Forms settings for each form
* Notification email addresses are production addresses (not developer/test addresses)
* Slack or webhook notifications configured if required

## 5.5 GDPR / Data Handling

Verify:

* Form data retention policy defined
* Privacy policy linked near each form collecting personal data
* Consent checkbox present where required by jurisdiction

---

# Phase 6: Netlify Functions & Edge Validation

## 6.1 Functions Directory

Verify `netlify.toml` points to correct functions directory:

```toml
[build]
  functions = "netlify/functions"
```

Verify:

* All `.js` or `.ts` function files present in functions directory
* No orphaned function references in frontend code
* Function filenames match how they are called from the frontend

## 6.2 Function Code Review

For each function:

Verify:

* Input validation on all incoming parameters (type, length, format)
* No direct use of user input in shell commands, file paths, or database queries
* Error responses do not expose stack traces or internal paths
* All secrets accessed via `process.env` and not hardcoded
* CORS headers set correctly if called from the browser:

```js
const headers = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
```

Verify `Access-Control-Allow-Origin` is never set to `*` for authenticated or sensitive endpoints.

## 6.3 Edge Functions

Verify:

* Edge functions directory configured in `netlify.toml`:

```toml
[[edge_functions]]
  path = "/api/*"
  function = "api-handler"
```

* Edge functions do not perform operations requiring Node.js-only APIs (use Functions instead)
* Geolocation or A/B logic tested across relevant regions

## 6.4 Function Error Handling

Verify every function:

* Returns appropriate HTTP status codes (200, 400, 401, 403, 404, 500)
* Has a try/catch wrapping the main logic
* Logs errors without exposing sensitive data
* Does not return raw error objects to the client

## 6.5 Function Rate Limiting

Verify:

* High-traffic or sensitive functions (contact, auth, payment) have rate limiting applied
* Rate limiting enforced at function level or via Netlify WAF rules if available
* Abuse monitoring configured

## 6.6 Function Testing

Test each function via:

```bash
netlify dev
```

Verify:

* All functions respond correctly locally
* Functions called by forms are tested end-to-end
* Functions that call third-party APIs return correct data under success and failure conditions

---

# Phase 7: Third-Party API Validation

For every third-party API integration:

## 7.1 Authentication

Verify:

* API keys stored in Netlify environment variables only
* API keys never exposed in `_site/` output, JavaScript bundles, or HTML
* Separate API keys used for staging and production environments
* API keys scoped to minimum required permissions

## 7.2 Request Validation

Verify:

* All API responses validated before use (null checks, schema validation)
* Failed API responses handled gracefully (fallback content or error state shown to user)
* No site-breaking behavior if an API is temporarily unavailable

## 7.3 Rate Limiting and Quotas

Verify:

* API rate limits documented and monitored
* Retry logic with exponential backoff implemented where appropriate
* Caching layer applied for non-real-time data to reduce API call volume

## 7.4 Data Sanitization

Verify:

* All data returned from third-party APIs sanitized before rendering in HTML (prevent XSS via API response injection)
* JSON responses parsed safely; never passed to `eval()` or `innerHTML` directly
* File uploads processed only through validated, sandboxed pipelines

## 7.5 Fallback and Resilience

Verify:

* Site does not hard-fail if an API is down
* Graceful degradation UI shown to users when API data is unavailable
* Timeouts configured on all outbound API calls

## 7.6 Privacy and Data Handling

Verify:

* No personal user data sent to third-party APIs without user consent
* Third-party API data handling reviewed against GDPR, PDPA, or applicable regulations
* Data Processing Agreements (DPAs) signed with all API vendors handling personal data where required

---

# Phase 8: CloudCannon CMS Validation

## 8.1 Configuration File

Verify `cloudcannon.config.yml` (or `cloudcannon.config.js`) is present and valid:

```bash
cat cloudcannon.config.yml
```

Verify:

* Collections defined for all editable content types
* `_schema` or `schemas` defined for structured data
* No broken paths in collection configuration

## 8.2 Editable Regions

Verify the following are editable by CMS users:

**SEO:**

* Page title
* Meta description
* Social (OG) image
* Canonical URL override (if needed)

**Navigation:**

* Header navigation items and URLs
* Footer navigation items and URLs
* CTA button labels and URLs

**Content:**

* Hero headline, subheadline, and CTA
* Body page content
* Blog/post content

**Media:**

* Image sources
* Image alt text (editable per image)

**Forms:**

* No hardcoded recipient email addresses (use environment variables)

## 8.3 Front Matter Schema

Verify:

* All editable fields have correct types (`text`, `rich_text`, `image`, `boolean`, etc.)
* Required fields marked as required in schema
* No fields that allow arbitrary HTML input without sanitization
* Image fields enforce allowed file types

## 8.4 Previews

Verify:

* Visual editor previews render correctly for all collection types
* Live editing does not break layout
* Preview URLs accessible to CMS users

## 8.5 User Permissions

Verify:

* CMS user roles configured to minimum required access
* Editors cannot modify `_config.yml` or `netlify.toml` via CMS
* Publishing workflow configured (if draft/review flow required)

---

# Phase 9: SEO Validation

## 9.1 Metadata

Every indexable page must contain:

* `<title>` tag (unique per page, 50–60 characters)
* `<meta name="description">` (unique per page, 150–160 characters)
* Canonical URL (`<link rel="canonical">`)

Verify no duplicate titles or descriptions across pages.

## 9.2 Social Metadata

Every indexable page must contain:

* `og:title`
* `og:description`
* `og:image` (minimum 1200×630px)
* `og:url`
* `og:type`
* `twitter:card`
* `twitter:title`
* `twitter:description`
* `twitter:image`

## 9.3 Sitemap

Verify `sitemap.xml` is generated and valid:

```bash
cat _site/sitemap.xml
```

Verify:

* All indexable pages listed
* No noindex pages included
* All URLs use production domain (HTTPS)
* Canonical URLs match sitemap URLs exactly

## 9.4 Robots.txt

Verify `robots.txt` exists:

```bash
cat _site/robots.txt
```

Verify:

* Production configuration (no `Disallow: /` present for production builds)
* `Sitemap:` directive references correct production sitemap URL
* Staging/preview deployments use `Disallow: /`

## 9.5 Structured Data

Verify JSON-LD:

* Validates at https://search.google.com/test/rich-results
* No malformed schema objects
* `Organization`, `WebSite`, `BreadcrumbList`, and other applicable schemas present

## 9.6 Indexability

Verify:

* No accidental `noindex` tags on production pages
* `JEKYLL_ENV=production` used during build (affects conditional noindex logic)
* Staging Netlify previews are blocked from indexing (via `X-Robots-Tag: noindex` header)

Set noindex header for deploy previews in `netlify.toml`:

```toml
[[context.deploy-preview.headers]]
  for = "/*"
  [context.deploy-preview.headers.values]
    X-Robots-Tag = "noindex"
```

---

# Phase 10: Accessibility Validation

Target: WCAG 2.1 AA

## 10.1 Images

Verify:

* All content images have descriptive `alt` text
* Decorative images use `alt=""` and `role="presentation"`
* No `alt` text that is the image filename

## 10.2 Heading Structure

Verify:

* Single `<h1>` per page
* Logical heading hierarchy (no skipped levels)
* Headings describe page structure, not styled for appearance

## 10.3 Colour Contrast

Verify:

* Text contrast ratio minimum 4.5:1 (normal text)
* Large text minimum 3:1
* Interactive elements (buttons, links) have sufficient contrast in all states

Use: https://webaim.org/resources/contrastchecker/

## 10.4 Forms

Verify:

* Every input has an associated `<label>` (via `for`/`id` or `aria-label`)
* Required fields indicated both visually and via `required` attribute
* Error messages reference the field by name and describe how to fix
* Error focus management moves to first error on submission failure

## 10.5 Keyboard Navigation

Verify:

* All interactive elements reachable by Tab key
* Focus order follows logical visual order
* Visible focus indicator on all focusable elements (not removed via `outline: none`)
* No keyboard traps (modal dialogs must have Escape to close)
* Skip navigation link present at top of page

## 10.6 ARIA

Verify:

* No redundant ARIA (e.g. `role="button"` on a `<button>`)
* `aria-label` or `aria-labelledby` on all landmark regions
* Dynamic content updates announced via `aria-live` where appropriate
* No invalid ARIA attribute values

## 10.7 Motion

Verify:

* Animations respect `prefers-reduced-motion` media query
* No content that flashes more than 3 times per second

---

# Phase 11: Performance Validation

## 11.1 Images

Verify:

* Responsive `srcset` and `sizes` attributes on all large images
* Modern formats (WebP, AVIF) served where supported
* Images compressed appropriately (target: under 200KB for hero, under 100KB for content)
* Width and height attributes present to prevent layout shift

## 11.2 Loading Strategy

Verify:

* Hero images: NOT lazy loaded (`loading="eager"` or no attribute)
* Below-fold images: `loading="lazy"`
* LCP image preloaded:

```html
<link rel="preload" as="image" href="/assets/img/hero.webp">
```

## 11.3 JavaScript

Verify:

* `defer` used on non-critical scripts
* `async` used only where script order independence is confirmed
* No render-blocking scripts in `<head>` without `defer` or `async`
* JavaScript bundle size reviewed (target: under 50KB gzipped for inline JS)

## 11.4 CSS

Verify:

* Tailwind purge removes all unused utilities (inspect final CSS file size)
* No additional large unused CSS bundles included
* Critical CSS inlined or preloaded where applicable

## 11.5 Fonts

Verify:

* Web fonts use `font-display: swap` or `font-display: optional`
* Critical fonts preloaded:

```html
<link rel="preload" href="/assets/fonts/font.woff2" as="font" type="font/woff2" crossorigin>
```

* System font fallback defined in CSS until custom font loads

## 11.6 Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | Under 2.5s |
| FID / INP (Interaction to Next Paint) | Under 200ms |
| CLS (Cumulative Layout Shift) | Under 0.1 |
| TTFB (Time to First Byte) | Under 600ms |

## 11.7 Caching

Verify Netlify cache headers in `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

# Phase 12: Netlify Platform Validation

## 12.1 Build Configuration

Verify `netlify.toml`:

```toml
[build]
  command = "JEKYLL_ENV=production bundle exec jekyll build"
  publish = "_site"
  functions = "netlify/functions"

[build.environment]
  RUBY_VERSION = "3.x.x"
  NODE_VERSION = "20"
```

Verify:

* `JEKYLL_ENV=production` explicitly set in build command or environment
* `publish` directory matches Jekyll `destination` in `_config.yml`
* Ruby and Node versions pinned

## 12.2 Branch Deploys and Previews

Verify:

* Production branch (`main` or `master`) correctly set as production branch
* Deploy previews enabled for pull requests
* Branch deploy settings configured as intended
* Preview environments use `noindex` header (Phase 9.6)

## 12.3 Redirects

Verify each redirect rule in `netlify.toml` or `_redirects`:

* Source path is correct
* Destination path is correct
* HTTP status code is appropriate (301 permanent, 302 temporary, 200 rewrite)
* No redirect loops
* Redirect rules tested in deploy preview before production

Test redirects:

```bash
curl -I https://yourdomain.com/old-path
```

Expected: `Location: /new-path` header present.

## 12.4 Custom 404

Verify:

* Custom 404 page exists at `404.html` or `404/index.html` in `_site/`
* 404 page includes site navigation for recovery
* Netlify configured to serve custom 404

## 12.5 Environment Variables

Verify in Netlify UI under Site Settings → Environment Variables:

* All variables referenced in Functions and build hooks are present
* Values set for `Production` scope (not just `All`)
* No sensitive values in `netlify.toml` (reference variable names only)
* No unused variables remaining

## 12.6 HTTPS

Verify:

* SSL certificate provisioned and active in Netlify UI
* Custom domain HTTPS confirmed
* HSTS header applied (Phase 3.1)
* No mixed content warnings (Phase 3.3)

## 12.7 Domain Configuration

Verify:

* Primary domain configured (with and without `www`)
* Preferred domain set (www or apex)
* Non-preferred domain redirects to preferred domain
* DNS propagation confirmed

---

# Phase 13: Production Risk Review

Classify all remaining issues before deployment decision.

## Critical — Must Block Deployment

* Build failure
* Broken navigation or core pages missing
* Fatal runtime error in any Function
* CSP blocking legitimate functionality
* Secrets committed to repository or exposed in `_site/`
* HIGH/CRITICAL CVEs in dependencies
* Broken forms with no functional fallback
* Severe accessibility failure (site unusable without assistive technology)
* Invalid Netlify configuration causing deploy failure
* Missing HTTPS or active mixed content

## High — Strongly Recommended Before Launch

* Missing page metadata (title, description, canonical)
* Broken structured data / JSON-LD
* Significant Core Web Vitals regression (LCP > 4s, CLS > 0.25)
* CSP violations in browser console
* Missing SRI hashes on third-party scripts
* Honeypot absent from public forms
* Environment variables referencing non-existent Netlify variables
* CloudCannon editability broken for primary content fields

## Medium — Post-Launch Acceptable

* Minor Lighthouse deductions (< 5 point drop)
* Small accessibility improvements (non-blocking)
* Non-critical redirect optimizations
* Minor CMS UI improvements

## Low — Nice to Have

* Additional structured data schemas
* Further image compression gains
* Minor code cleanup

---

# Deployment Blocking Rules

Deployment MUST be blocked if any of the following exist:

* Build failure
* Fatal runtime error
* Broken navigation
* Broken forms
* Missing critical content
* Severe accessibility issue
* Major SEO misconfiguration
* Invalid Netlify configuration
* Secrets exposed in repository or build output
* HIGH or CRITICAL dependency CVEs unresolved
* Missing or misconfigured security headers (X-Frame-Options, CSP, HSTS)
* Functions referencing undefined environment variables
* Third-party API keys exposed in frontend assets

If any blocker exists:

```text
STATUS: NOT READY FOR PRODUCTION
```

---

# Deployment Approval Rules

Output:

```text
STATUS: READY FOR PRODUCTION
```

only when:

* Build passes with `JEKYLL_ENV=production`
* No blockers exist
* Critical issues = 0
* Security headers validated
* No secrets exposed
* Dependency audit passed

---

# Final Report Format

```yaml
deployment_report:

  status:                         # READY FOR PRODUCTION | NOT READY FOR PRODUCTION

  build:
    jekyll_build: pass | fail
    jekyll_env: production | staging | unknown
    tailwind_purge: pass | fail | not_verified
    exit_code: 0

  security:
    http_headers: pass | fail | partial
    csp_configured: true | false
    csp_violations: 0
    hsts_configured: true | false
    mixed_content: none | found
    sri_hashes_applied: true | false | partial
    secrets_in_repo: none | found
    secrets_in_site_output: none | found
    dependency_cves_critical: 0
    dependency_cves_high: 0
    dependency_cves_medium: 0
    third_party_scripts_audited: true | false

  forms:
    forms_detected: []
    honeypot_present: true | false
    captcha_configured: true | false
    submission_tested: true | false
    notifications_configured: true | false

  functions:
    functions_detected: []
    input_validation: pass | fail | partial
    error_handling: pass | fail | partial
    cors_configured: true | false
    rate_limiting: true | false
    tested_locally: true | false

  apis:
    integrations_detected: []
    keys_in_env_vars: true | false
    fallback_ui_present: true | false
    responses_sanitized: true | false

  cloudcannon:
    config_valid: true | false
    seo_editable: true | false
    navigation_editable: true | false
    content_editable: true | false
    media_editable: true | false

  seo:
    all_pages_have_title: true | false
    all_pages_have_description: true | false
    all_pages_have_canonical: true | false
    og_metadata: true | false
    sitemap_valid: true | false
    robots_valid: true | false
    structured_data_valid: true | false
    preview_noindex: true | false

  accessibility:
    wcag_target: 2.1 AA
    single_h1_per_page: true | false
    images_have_alt: true | false
    keyboard_navigable: true | false
    colour_contrast_pass: true | false
    forms_labelled: true | false

  performance:
    lcp:
    inp:
    cls:
    ttfb:
    css_bundle_size_kb:
    js_bundle_size_kb:

  lighthouse:
    performance:
    accessibility:
    best_practices:
    seo:

  netlify:
    build_config_valid: true | false
    redirects_tested: true | false
    custom_404_present: true | false
    https_active: true | false
    env_vars_complete: true | false
    domain_configured: true | false

  completed_items: []

  fixed_issues: []

  remaining_manual_tasks: []

  risks:
    critical: []
    high: []
    medium: []
    low: []

  recommendations: []
```

---

# Agent Rules

Before declaring completion:

* Revalidate all modified templates, layouts, and includes.
* Rerun Jekyll build with `JEKYLL_ENV=production` after any change.
* Revalidate Tailwind purge output after any template change.
* Revalidate `netlify.toml` after any configuration change.
* Revalidate all security headers after any header configuration change.
* Recheck CSP for violations after any new third-party resource added.
* Revalidate Functions after any code change.
* Revalidate CloudCannon editability after any front matter schema change.
* Rerun dependency audit after any gem or npm package added or updated.

Never assume a fix worked. Always verify.

---

# Success Condition

A project is considered production-ready only when all of the following are true:

* Production Jekyll build succeeds (`JEKYLL_ENV=production`, exit code 0)
* TailwindCSS purge is correct and no classes are incorrectly stripped
* HTTP security headers configured (X-Frame-Options, CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
* CSP validated with zero console violations
* No secrets in repository or site output
* Dependency audit passes (zero HIGH/CRITICAL CVEs)
* All forms have bot protection and have been tested end-to-end
* All Netlify Functions validated, input-validated, and error-handled
* All third-party API integrations secured and resilient
* CloudCannon CMS editability confirmed for all content, SEO, and media fields
* SEO metadata complete on all indexable pages
* Sitemap and robots.txt valid and production-configured
* Accessibility: WCAG 2.1 AA, single H1, keyboard navigable, all images alt-tagged
* Core Web Vitals within acceptable targets
* Netlify configuration valid with tested redirects and custom 404
* HTTPS active with no mixed content
* Preview/staging deployments blocked from search indexing

Until all conditions are met: continue auditing, fixing, validating, and reporting.