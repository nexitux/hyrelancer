# SEO Metadata Testing Checklist

This document provides a manual testing checklist for the SEO metadata system implementation.

## Pre-Testing Setup

1. Start the development server: `npm run dev`
2. Open browser developer tools (F12)
3. Navigate to the application

## Test Cases

### 1. Default Metadata (Home Page)

**Test**: Home page with no overrides shows default title and description

**Steps**:
1. Navigate to the home page (`/`)
2. Check the browser tab title
3. View page source and locate the meta description tag

**Expected Results**:
- [ ] Title shows: "Hyrelancer - A Freelancer Marketplace"
- [ ] Meta description shows: "Hyrelancer - The best freelancer marketplace to connect clients and freelancers. Find skilled professionals or get your projects done."
- [ ] Open Graph title shows: "Hyrelancer - A Freelancer Marketplace"
- [ ] Open Graph description shows: "Hyrelancer - The best freelancer marketplace to connect clients and freelancers. Find skilled professionals or get your projects done."

**Status**: ⬜ Pass / ⬜ Fail

---

### 2. Page Title Override

**Test**: Page with title override shows "PageTitle - SiteTitle" format

**Steps**:
1. Navigate to a page that uses `usePageSEO` with a title override
2. Check the browser tab title
3. View page source and locate the title tag

**Expected Results**:
- [ ] Title shows: "Home - Hyrelancer - A Freelancer Marketplace"
- [ ] Only one `<title>` tag exists
- [ ] Title is properly formatted

**Status**: ⬜ Pass / ⬜ Fail

---

### 3. Open Graph Image Override

**Test**: Page-level OG image override shows custom og:image tag

**Steps**:
1. Navigate to a page with custom OG image
2. View page source and locate og:image meta tag
3. Check that the image URL is absolute (starts with http/https)

**Expected Results**:
- [ ] og:image shows the custom image URL
- [ ] Image URL is absolute (not relative)
- [ ] Other OG tags fall back to defaults

**Status**: ⬜ Pass / ⬜ Fail

---

### 4. External Script Allowlist

**Test**: Allowed external scripts load, blocked scripts are prevented

**Steps**:
1. Add a script URL to the allowed list in `meta-defaults.js`
2. Use the script in a page's metadata
3. Check browser developer tools for the script element
4. Try to load a script not in the allowlist
5. Check console for warning message

**Expected Results**:
- [ ] Allowed scripts appear in the DOM
- [ ] Scripts load asynchronously (async/defer attributes)
- [ ] Blocked scripts do not appear in the DOM
- [ ] Console warning appears for blocked scripts

**Status**: ⬜ Pass / ⬜ Fail

---

### 5. Canonical URL Logic

**Test**: Canonical URLs are properly constructed

**Steps**:
1. Navigate to different pages
2. View page source and locate canonical link tag
3. Check that URLs are absolute

**Expected Results**:
- [ ] Canonical URLs are absolute (start with http/https)
- [ ] Relative paths are converted to absolute URLs
- [ ] Custom canonical URLs are preserved

**Status**: ⬜ Pass / ⬜ Fail

---

### 6. Meta Tag Merging

**Test**: Page overrides properly merge with defaults

**Steps**:
1. Create a page with partial metadata overrides
2. Check that overridden values are used
3. Check that non-overridden values use defaults

**Expected Results**:
- [ ] Overridden values appear in meta tags
- [ ] Default values are used for non-overridden fields
- [ ] No duplicate meta tags exist

**Status**: ⬜ Pass / ⬜ Fail

---

### 7. Twitter Card Tags

**Test**: Twitter Card meta tags are properly set

**Steps**:
1. Navigate to a page with Twitter metadata
2. View page source and locate Twitter meta tags
3. Check that all required Twitter tags are present

**Expected Results**:
- [ ] twitter:card is set to "summary_large_image"
- [ ] twitter:title is set
- [ ] twitter:description is set
- [ ] twitter:image is set
- [ ] twitter:creator and twitter:site are set

**Status**: ⬜ Pass / ⬜ Fail

---

### 8. Navigation Between Pages

**Test**: Meta tags update when navigating between pages

**Steps**:
1. Navigate to home page
2. Navigate to another page with different metadata
3. Check that meta tags update
4. Use browser back/forward buttons

**Expected Results**:
- [ ] Title updates when navigating
- [ ] Meta description updates
- [ ] Open Graph tags update
- [ ] No stale meta tags remain

**Status**: ⬜ Pass / ⬜ Fail

---

### 9. Social Media Preview Testing

**Test**: Social media previews work correctly

**Steps**:
1. Use Facebook Debugger (https://developers.facebook.com/tools/debug/)
2. Use Twitter Card Validator (https://cards-dev.twitter.com/validator)
3. Test with LinkedIn Post Inspector
4. Check that images and descriptions appear correctly

**Expected Results**:
- [ ] Facebook preview shows correct title, description, and image
- [ ] Twitter preview shows correct card format
- [ ] LinkedIn preview works correctly
- [ ] Images are properly sized (1200x630px recommended)

**Status**: ⬜ Pass / ⬜ Fail

---

### 10. Performance Testing

**Test**: SEO system doesn't impact page performance

**Steps**:
1. Open browser developer tools
2. Navigate to pages with SEO metadata
3. Check for any console errors
4. Monitor page load times

**Expected Results**:
- [ ] No JavaScript errors in console
- [ ] Page load times are not significantly impacted
- [ ] Meta tags are applied quickly
- [ ] No memory leaks or performance issues

**Status**: ⬜ Pass / ⬜ Fail

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Default Metadata | ⬜ Pass / ⬜ Fail | |
| Page Title Override | ⬜ Pass / ⬜ Fail | |
| Open Graph Image Override | ⬜ Pass / ⬜ Fail | |
| External Script Allowlist | ⬜ Pass / ⬜ Fail | |
| Canonical URL Logic | ⬜ Pass / ⬜ Fail | |
| Meta Tag Merging | ⬜ Pass / ⬜ Fail | |
| Twitter Card Tags | ⬜ Pass / ⬜ Fail | |
| Navigation Between Pages | ⬜ Pass / ⬜ Fail | |
| Social Media Preview | ⬜ Pass / ⬜ Fail | |
| Performance Testing | ⬜ Pass / ⬜ Fail | |

## Overall Status

**Total Tests**: 10  
**Passed**: ___  
**Failed**: ___  
**Overall Result**: ⬜ Pass / ⬜ Fail

## Notes

_Add any additional notes, issues, or observations here:_

---

## Tested By

**Name**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Version**: ________________
