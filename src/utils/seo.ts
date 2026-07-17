// Applies the admin-editable SEO description (siteSettings.seoDescription) to the
// document's <meta name="description"> tag. Creates the tag if it doesn't exist yet.
// Safe to call from any page's content-fetch handler.
export function applySeoDescription(siteSettings?: { seoDescription?: string } | null) {
  const description = siteSettings?.seoDescription;
  if (!description) return;

  let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", description);
}
