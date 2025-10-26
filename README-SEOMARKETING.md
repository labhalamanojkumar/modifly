SEO & Monetization Playbook
==========================

This short playbook summarizes actions to increase organic traffic and monetize with ads.

1) Content
 - Create long-form landing pages (500–1000+ words) for each tool. Include H1, H2s, screenshots, and a short demo GIF.
 - Add targeted FAQs and HowTo steps. We added JSON-LD for Merge/Split/Convert; expand with richer Q&A.

2) Technical SEO
 - Ensure `metadata` and openGraph images are correct per page (`app/layout.tsx` and per-page exports).
 - Submit `sitemap.xml` to Google Search Console and re-index after major updates.

3) Performance
 - Self-host critical fonts or use `font-display: swap` to avoid FOIT.
 - Optimize images; use next/image where applicable and a CDN in production.

4) Ads & Privacy
 - Use `ConsentBanner` to obtain consent for personalized ads.
 - Keep `ads.txt` updated with your publisher ID to prevent unauthorized resellers.

5) Tracking & Measurement
 - Use GA4 with server-side tagging if you need stronger privacy controls.

6) Backlinks & Outreach
 - Publish guest posts and guides linking to your tool pages. Reach out to SaaS review sites and directories.

7) Monitoring
 - Use Google Search Console, Google Analytics, and Lighthouse to monitor indexing, traffic, and CWV.
