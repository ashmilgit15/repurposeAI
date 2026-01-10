export function generatePrompt(format: string, content: string, voice: string): string {
  const prompts: Record<string, string> = {
    twitter: `You are a social media expert. Convert this content into a Twitter/X thread.

Rules:
- Create 5-10 tweets
- Each tweet MUST be under 280 characters
- Number each tweet (1/, 2/, 3/, etc.)
- First tweet must hook the reader
- Use line breaks for readability
- End with a call-to-action
- Tone: ${voice}

Original content:
${content}

Generate the Twitter thread now:`,

    linkedin: `You are a LinkedIn content strategist. Convert this into a LinkedIn post.

Rules:
- 1,300-2,000 characters total
- Professional tone, but ${voice.toLowerCase()}
- Start with a hook (question or bold statement)
- Use short paragraphs (2-3 lines max)
- Include 3-5 relevant hashtags at the end
- End with an engagement question

Original content:
${content}

Generate the LinkedIn post now:`,

    instagram: `You are an Instagram content creator. Convert this into an Instagram caption.

Rules:
- Casual, engaging tone (${voice.toLowerCase()})
- First sentence must grab attention
- Use emojis naturally (not excessive)
- Include 10-15 relevant hashtags
- Max 2,200 characters
- Include a call-to-action (tag a friend, save, share)

Original content:
${content}

Generate the Instagram caption now:`,

    email: `You are an email marketing expert. Convert this into an email newsletter.

Rules:
- Compelling subject line
- Friendly greeting
- Short intro paragraph
- 3-5 main sections with clear headers
- Conclusion paragraph
- Clear call-to-action
- Professional sign-off
- Tone: ${voice}

Original content:
${content}

Generate the email newsletter now (include subject line):`,

    youtube: `You are a YouTube script writer. Convert this into a YouTube video script.

Rules:
- Hook in first 10 seconds
- Clear intro, body, conclusion structure
- Include timestamps suggestions
- Conversational tone (${voice.toLowerCase()})
- Add presenter notes in [brackets]
- End with strong CTA (like, subscribe, comment)
- 5-10 minute video length

Original content:
${content}

Generate the YouTube script now:`,

    tiktok: `You are a TikTok content creator. Convert this into a TikTok/Reels script.

Rules:
- 15-60 seconds duration
- STRONG hook in first 3 seconds
- Fast-paced, energetic
- Include visual cues in [brackets]
- Use trending language/phrases
- Clear call-to-action at end
- Tone: ${voice} but energetic

Original content:
${content}

Generate the TikTok script now:`,

    facebook: `You are a Facebook content strategist. Convert this into a Facebook post.

Rules:
- Conversational, friendly tone (${voice.toLowerCase()})
- 400-800 characters ideal
- Ask a question to drive engagement
- Use casual language
- Include relevant emojis
- End with clear CTA

Original content:
${content}

Generate the Facebook post now:`,

    pinterest: `You are a Pinterest SEO expert. Convert this into a Pinterest pin description.

Rules:
- Keyword-rich (SEO optimized)
- 100-500 characters
- Include relevant keywords naturally
- Clear benefit statement
- Call-to-action
- Use 2-3 relevant hashtags
- Tone: ${voice}

Original content:
${content}

Generate the Pinterest description now:`,

    blog_summary: `You are a content editor. Create a TL;DR summary of this content.

Rules:
- 3-5 sentences max
- Capture main points
- Clear, concise language
- No fluff
- Tone: ${voice}

Original content:
${content}

Generate the summary now:`,

    reddit: `You are a Reddit power user. Convert this into a Reddit post.

Rules:
- Authentic, genuine tone
- No corporate speak
- Add value to the community
- Use proper Reddit formatting (markdown)
- Conversational (${voice.toLowerCase()})
- Include TL;DR at end if post is long

Original content:
${content}

Generate the Reddit post now:`,
  }

  return prompts[format] || prompts['twitter']
}
