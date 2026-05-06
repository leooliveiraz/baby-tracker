import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhotoAvatar from '../components/ui/PhotoAvatar'

describe('PhotoAvatar', () => {
  it('renders fallback emoji when no photo', () => {
    render(<PhotoAvatar name="Maria" size={48} />)
    expect(screen.getByText('👶')).toBeInTheDocument()
  })

  it('renders image when photo URL is provided', () => {
    render(<PhotoAvatar photo="https://example.com/photo.jpg" name="Maria" size={48} />)
    const img = screen.getByAltText('Maria')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })

  it('renders fallback on image error', () => {
    render(<PhotoAvatar photo="invalid-url" name="João" size={48} />)
    const img = screen.getByAltText('João')
    expect(img).toBeInTheDocument()
  })
})
