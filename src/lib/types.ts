export interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'pro'
  jobs_this_month: number
  jobs_reset_date: string
  stripe_customer_id: string | null
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  input_text: string
  input_method: 'paste' | 'upload'
  brand_voice: string
  selected_formats: string[]
  outputs: Record<string, string>
  created_at: string
}

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'email'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'pinterest'
  | 'blog_summary'
  | 'reddit'

export const PLATFORM_INFO: Record<Platform, { label: string; icon: string; description: string; beta?: boolean }> = {
  twitter: { label: 'Twitter/X Thread', icon: '🐦', description: 'Thread format, 280 char limit per tweet' },
  linkedin: { label: 'LinkedIn Post', icon: '💼', description: 'Professional networking post' },
  instagram: { label: 'Instagram Caption', icon: '📸', description: 'Engaging caption with hashtags' },
  email: { label: 'Email Newsletter', icon: '📧', description: 'Full newsletter with subject line' },
  youtube: { label: 'YouTube Video Script', icon: '🎬', description: 'Script with hooks and timestamps', beta: true },
  tiktok: { label: 'TikTok/Reels Script', icon: '🎵', description: 'Short-form video script', beta: true },
  facebook: { label: 'Facebook Post', icon: '👥', description: 'Casual social media post', beta: true },
  pinterest: { label: 'Pinterest Description', icon: '📌', description: 'SEO-optimized pin description', beta: true },
  blog_summary: { label: 'Blog Summary (TL;DR)', icon: '📝', description: 'Concise content summary' },
  reddit: { label: 'Reddit Post', icon: '🔴', description: 'Authentic community post', beta: true },
}

export const FREE_TIER_LIMIT = 3
// All formats now available to everyone
export const FREE_TIER_FORMATS = ['twitter', 'linkedin', 'instagram', 'email', 'blog_summary', 'youtube', 'tiktok', 'facebook', 'pinterest', 'reddit']
