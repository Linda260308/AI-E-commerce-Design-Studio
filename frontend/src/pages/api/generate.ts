import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  image_url?: string;
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
    const { image, prompt, aspect_ratio = '1:1' } = req.body;

    // 验证必填参数
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必填参数：image 和 prompt' 
      });
    }

    // 调用阿里云 DashScope API 生成图片
    const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-46c536ffaf7140679d76a35016d9a488';
    
    // 构建提示词
    const fullPrompt = `Professional e-commerce product photo with:
- Main product: [uploaded image]
- Background: ${prompt}
- Style: Studio quality, soft lighting, professional product photography
- Product should be the focal point, realistic and detailed`;

    // 调用阿里云 API
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-image-2.0',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    image: image,
                  },
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
          },
          parameters: {
            n: 1,
            watermark: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 调用失败');
    }

    const result = await response.json();

    if (result.output && result.output.results && result.output.results[0]) {
      const imageUrl = result.output.results[0].url;
      
      return res.status(200).json({
        success: true,
        image_url: imageUrl,
      });
    } else {
      throw new Error('API 响应格式异常');
    }
  } catch (error: any) {
    console.error('生成错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '生成失败，请稍后重试',
    });
  }
}
