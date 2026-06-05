# FINALIZE.md

# Production Release Checklist

This document defines the mandatory final validation process before a project can be marked as production-ready.

---

# Purpose

The objective is to ensure:

* Production stability
* Deployment readiness
* SEO readiness
* Accessibility compliance
* Performance optimization
* CMS maintainability
* Netlify compatibility

No deployment should be considered complete until this checklist has been executed.

---

# Required Workflow

Execute the following phases in order:

1. Final Build Validation
2. SEO Validation
3. Accessibility Validation
4. Performance Validation
5. CMS Validation
6. Netlify Validation
7. Production Risk Review
8. Final Report Generation

Do not skip any phase.

---

# Phase 1: Final Build Validation

Verify:

* Project builds successfully
* No fatal build errors
* No unresolved imports
* No missing assets
* No missing includes/layouts
* No broken Liquid templates
* No Jekyll warnings that could impact production

Required:

```bash
bundle exec jekyll build
```

Expected result:

```text
Build successful
Exit code: 0
```

If build fails:

STOP.

Create blocker report.

Do not continue.

---

# Phase 2: SEO Validation

Verify:

## Metadata

Every indexable page contains:

* title
* meta description
* canonical URL

## Social Metadata

Every indexable page contains:

* Open Graph title
* Open Graph description
* Open Graph image
* Twitter card metadata

## Sitemap

Verify:

* sitemap.xml generated
* URLs valid
* Canonicals match sitemap URLs

## Robots

Verify:

* robots.txt exists
* Production configuration enabled
* Sitemap location referenced

## Structured Data

Verify:

* JSON-LD valid
* No malformed schema

---

# Phase 3: Accessibility Validation

Verify:

## Images

* All content images have alt text
* Decorative images use appropriate handling

## Headings

Verify:

* Single H1 per page
* Logical hierarchy

## Forms

Verify:

* Labels associated correctly
* Validation accessible

## Keyboard Navigation

Verify:

* Reachable controls
* Visible focus indicators
* No keyboard traps

## ARIA

Verify:

* No redundant ARIA
* No invalid ARIA usage

Target:

WCAG 2.1 AA

---

# Phase 4: Performance Validation

Verify:

## Images

* Responsive sizing
* Proper compression
* Modern formats where appropriate

## Loading

Verify:

* Non-critical images lazy loaded
* Hero images not lazy loaded

## Scripts

Verify:

* defer used where appropriate
* async used where appropriate

## CSS

Verify:

* Tailwind purge effective
* No large unused bundles

## Fonts

Verify:

* Optimized loading
* Critical fonts preloaded

## Layout Stability

Verify:

* Width/height attributes
* No avoidable CLS issues

---

# Phase 5: CMS Validation

Verify CloudCannon editability for:

## SEO

* title
* description
* social image

## Navigation

* header navigation
* footer navigation

## Content

* page content
* hero content
* CTA content

## Media

* image sources
* alt text

Avoid hardcoded editable content.

---

# Phase 6: Netlify Validation

Verify:

## Build Configuration

* netlify.toml valid
* build command valid
* publish directory valid

## Redirects

Verify:

* redirects work
* rewrites work
* custom 404 works

## Environment Variables

Verify:

* variables referenced correctly
* no unused variables
* no exposed secrets

## HTTPS Readiness

Verify:

* HTTPS-safe assets
* no mixed content

---

# Phase 7: Production Risk Review

Classify remaining issues.

## Critical

Must block deployment.

Examples:

* Build failures
* Broken forms
* Missing core pages
* Fatal accessibility failures

## High

Strongly recommended before launch.

Examples:

* Missing metadata
* Broken structured data
* Significant performance regressions

## Medium

Post-launch acceptable.

Examples:

* Minor Lighthouse deductions
* Small accessibility improvements

## Low

Nice-to-have improvements.

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

If any blocker exists:

Output:

```text
STATUS: NOT READY FOR PRODUCTION
```

---

# Deployment Approval Rules

Only output:

```text
STATUS: READY FOR PRODUCTION
```

when:

* Build passes
* No blockers exist
* Critical issues = 0

---

# Final Report Format

Generate:

```yaml
deployment_report:

  status:

  completed_items:

  fixed_issues:

  remaining_manual_tasks:

  risks:
    critical:
    high:
    medium:
    low:

  recommendations:

  build_status:

  lighthouse:
    performance:
    accessibility:
    best_practices:
    seo:

  cache_summary:
    files_scanned:
    files_skipped:
    findings_reused:
    findings_new:
    findings_fixed:
    findings_remaining:
```

---

# Agent Rules

Before declaring completion:

* Revalidate all modified files.
* Revalidate all affected layouts.
* Revalidate all affected includes.
* Revalidate Netlify configuration.
* Revalidate SEO metadata generation.
* Revalidate CloudCannon editability.

Never assume a fix worked.

Always verify.

---

# Success Condition

A project is considered complete only when:

* Production build succeeds
* No critical blockers remain
* Core Web Vitals are acceptable
* SEO requirements are satisfied
* Accessibility requirements are satisfied
* CMS editability requirements are satisfied
* Netlify deployment requirements are satisfied

Until then, continue auditing, fixing, validating, and reporting.
