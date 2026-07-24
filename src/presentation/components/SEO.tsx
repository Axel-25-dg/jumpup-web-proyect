import { useEffect } from 'react'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
}

export default function SEO({
  title = 'JumpUp - La Revolución del Aprendizaje de Idiomas',
  description = 'Domina un nuevo idioma con JumpUp, la plataforma que combina inteligencia artificial adaptativa, gamificación inmersiva y una comunidad global.',
  keywords = 'JumpUp, aprender idiomas, app de idiomas, inteligencia artificial idiomas, UTE, cursos de idiomas',
  canonicalUrl,
  ogImage = 'https://guaman-idiomas-ute.online/media/media/e01cf6e3-a049-41/fb3b7ea542224085a866f8bb6f601c62.jpg',
  ogType = 'website',
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    const fullTitle = title.includes('JumpUp') ? title : `${title} - JumpUp`
    document.title = fullTitle

    // Helper for meta attributes
    const updateOrCreateMeta = (attrName: string, attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attrName, attrValue)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // 2. Meta description and keywords
    updateOrCreateMeta('name', 'description', description)
    updateOrCreateMeta('name', 'keywords', keywords)

    // 3. Open Graph
    updateOrCreateMeta('property', 'og:title', fullTitle)
    updateOrCreateMeta('property', 'og:description', description)
    updateOrCreateMeta('property', 'og:image', ogImage)
    updateOrCreateMeta('property', 'og:type', ogType)
    
    const currentUrl = canonicalUrl || window.location.href
    updateOrCreateMeta('property', 'og:url', currentUrl)

    // 4. Twitter Cards
    updateOrCreateMeta('name', 'twitter:title', fullTitle)
    updateOrCreateMeta('name', 'twitter:description', description)
    updateOrCreateMeta('name', 'twitter:image', ogImage)

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)

  }, [title, description, keywords, canonicalUrl, ogImage, ogType])

  return null
}
