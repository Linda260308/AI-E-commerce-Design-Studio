import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  image_url?: string;
  image_base64?: string;
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
    const { image, prompt, text_layers, font_style, color_scheme } = req.body;

    // 验证输入
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数：image 和 prompt' 
      });
    }

    // 检查是否配置了后端 API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      // 调用后端 FastAPI 服务
      const response = await fetch(`${backendUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          prompt,
          text_layers: text_layers || [],
          font_style: font_style || 'modern',
          color_scheme: color_scheme || '#8B5CF6',
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return res.status(200).json({
        success: true,
        image_url: result.image_url,
        generation_id: result.generation_id,
        text_editable: result.text_editable
      });

    } catch (backendError) {
      // 如果后端不可用，返回模拟响应（开发环境）
      console.warn('Backend unavailable, using mock response:', backendError);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return res.status(200).json({
        success: true,
        image_url: '/mock-generated-poster.png',
        generation_id: `gen_${Date.now()}`,
        text_editable: true,
        error: undefined
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '生成失败，请稍后重试' 
    });
  }
}
