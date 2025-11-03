import sanitizeHtml from "sanitize-html"

// Sanitize input while preserving inner text of script/style tags
export const sanitizeInput = (value: string) => {
  if (!value) return ""
  // We want to preserve inner text of script/style tags
  // by setting nonTextTags: [] so inner text is preserved, then disallow all tags.
  const cleaned = sanitizeHtml(value, {
    allowedTags: [], // Disallow all tags
    allowedAttributes: {}, // Disallow all attributes
    nonTextTags: [], // MAKE script/style not "non-text" so innerText preserved
  })

  // Trim leading/trailing whitespace
  return cleaned.trim()
}
