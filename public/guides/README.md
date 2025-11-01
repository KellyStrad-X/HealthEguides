# Guide HTML Files

## Overview
This directory contains the HTML versions of your health guides that customers will access after purchase.

## File Naming Convention
Files should match the `id` field from `lib/guides.ts`:

```
perimenopause-playbook.html  → Guide ID: "perimenopause-playbook"
pcos-guide.html              → Guide ID: "pcos-guide"
fertility-boost.html         → Guide ID: "fertility-boost"
```

## File Structure
Each guide should be a self-contained HTML file with embedded CSS and any necessary assets (images can be relative or use CDN).

## Example Guide Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Guide Title</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { color: #4ECDC4; }
    h2 { color: #556FB5; margin-top: 40px; }
    /* Add more styles */
  </style>
</head>
<body>
  <h1>Guide Title</h1>

  <section>
    <h2>Introduction</h2>
    <p>Your content here...</p>
  </section>

  <!-- More sections -->

</body>
</html>
```

## Creating Guides

### Option 1: Convert from PDF
If you have PDF guides, convert them to HTML:
1. Use tools like Adobe Acrobat or online converters
2. Clean up the HTML
3. Add custom styling
4. Test on mobile devices

### Option 2: Write HTML Directly
Use the existing guide content and format as HTML with proper structure, styling, and responsive design.

### Option 3: Use the Agent System (Recommended)
Based on your project structure, you have agents in:
```
/home/kelly/Desktop/HealthEGuides INTERNAL/
├── AG1 - Research/
├── AG2 - Handoff/
└── AG3 - Output/
```

These can be used to generate guide content automatically.

## Best Practices

### Mobile-First Design
- Use responsive CSS (viewport width, media queries)
- Readable font sizes (16px minimum)
- Touch-friendly spacing
- Test on actual mobile devices

### Performance
- Inline CSS (no external stylesheets)
- Optimize images (compress, use WebP)
- Keep total file size under 2MB

### Accessibility
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- Sufficient color contrast
- Semantic HTML

### Styling Tips
```css
/* Mobile-friendly base */
body {
  font-size: 16px;
  line-height: 1.6;
  padding: 20px;
}

/* Desktop adjustments */
@media (min-width: 768px) {
  body {
    font-size: 18px;
    padding: 40px;
  }
}

/* Print-friendly */
@media print {
  body {
    font-size: 12pt;
    color: black;
  }
}
```

## Testing Your Guides

### Local Testing
1. Place HTML file in `public/guides/`
2. Run `npm run dev`
3. Visit: `http://localhost:3000/guides/[slug]?access=test123`
   (You'll need a test purchase record in Firebase with token "test123")

### Mobile Testing
- Test on iPhone Safari
- Test on Android Chrome
- Check tablet views
- Verify "Add to Home Screen" functionality

### Checklist
- [ ] Guide displays correctly on mobile
- [ ] All images load
- [ ] Links work (if any)
- [ ] Text is readable without zooming
- [ ] Page scrolls smoothly
- [ ] Works offline (after first load)

## Adding New Guides

1. Create HTML file: `public/guides/your-guide-id.html`
2. Add guide metadata to: `lib/guides.ts`
3. Deploy changes
4. Test purchase flow
5. Verify access link works

## Placeholder Notice

Until you add actual guide HTML files, customers will see a friendly placeholder message saying "Guide Content Coming Soon!" with their purchase details.

To remove the placeholder and show actual content:
1. Create the HTML file with the correct filename
2. Redeploy your site
3. Existing access links will automatically show the new content

---

**Pro Tip:** Keep a backup of all guide HTML files in your repository and version control them separately to track changes over time.
