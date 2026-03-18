import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  image_url?: string;
  generation_id?: string;
  text_editable?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { image, prompt, text_content, font_style, color_scheme } = req.body;

    // Validate input
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: image and prompt' 
      });
    }

    // Call AI service (Nano Banana 2 via API 易)
    const apiKey = process.env.APIYI_KEY || process.env.NANO_BANANA_KEY;
    
    if (!apiKey) {
      // Mock response for development
      console.log('⚠️ No API key configured, returning mock response');
      return res.status(200).json({
        success: true,
        image_url: '/mock-generated-poster.png',
        generation_id: `gen_${Date.now()}`,
        text_editable: true
      });
    }

    // Prepare AI generation request
    const aiPayload = {
      model: 'nano-banana-2',
      prompt: `${prompt}, professional e-commerce product photography, studio lighting, high quality, 4k`,
      image: image,
      text_overlay: text_content,
      text_style: {
        font: font_style || 'modern',
        color: color_scheme || '#8B5CF6'
      }
    };

    // Call API 易 service
    const response = await fetch('https://api.apiyi.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(aiPayload)
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json();

    return res.status(200).json({
      success: true,
      image_url: result.image_url,
      generation_id: result.id || `gen_${Date.now()}`,
      text_editable: true
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed' 
    });
  }
}
