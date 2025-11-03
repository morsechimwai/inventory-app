import sanitizeHtml from "sanitize-html"

export const sanitizeInput = (value: string) => {
  if (!value) return ""

  // วิธีที่ง่าย: ให้ sanitize-html ไม่ treat script/style as non-text
  // by setting nonTextTags: [] so inner text is preserved, then disallow all tags.
  const cleaned = sanitizeHtml(value, {
    allowedTags: [], // เอา tag ออกทั้งหมด
    allowedAttributes: {}, // เอา attribute ออกทั้งหมด
    nonTextTags: [], // MAKE script/style not "non-text" so innerText preserved
  })

  return cleaned.trim()
}
