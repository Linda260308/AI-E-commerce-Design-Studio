# API 集成示例代码

## 1. 核心生成函数 (Python)

```python
# backend/app/services/poster_generator.py

import requests
import base64
import os
from typing import Optional, Dict, Any

class PosterGenerator:
    """电商海报生成服务"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable"
        }
    
    def generate_poster(
        self,
        product_image_base64: str,
        prompt: str,
        text_content: str = "",
        size: str = "1024x1024"
    ) -> Dict[str, Any]:
        """
        生成电商海报
        
        Args:
            product_image_base64: 产品图片 base64
            prompt: 背景描述 (英文)
            text_content: 文字内容
            size: 图片尺寸
            
        Returns:
            生成结果
        """
        # 构造优化后的提示词
        full_prompt = self._build_prompt(prompt, text_content)
        
        # 构造请求体
        payload = {
            "model": "qwen-image-max",
            "input": {
                "prompt": full_prompt,
                "image": product_image_base64
            },
            "parameters": {
                "size": size,
                "n": 1
            }
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "success": True,
                "image_url": result["output"]["results"][0]["url"],
                "generation_id": result.get("request_id", "")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _build_prompt(self, prompt: str, text_content: str) -> str:
        """构建电商优化提示词"""
        base = f"""Professional e-commerce product photo with:
- Main product: [uploaded image]
- Background: {prompt}
- Style: Studio quality, soft lighting, professional product photography
"""
        if text_content:
            base += f"- Text overlay: Add \"{text_content}\" in bold at top\n"
            base += "- The text should be clearly separated from the background\n"
        
        base += "- Product should be the focal point, realistic and detailed"
        return base


# 使用示例
if __name__ == "__main__":
    generator = PosterGenerator(api_key="sk-your-api-key")
    
    # 读取产品图片
    with open("product.jpg", "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()
    
    # 生成海报
    result = generator.generate_poster(
        product_image_base64=f"data:image/jpeg;base64,{img_base64}",
        prompt="modern living room with soft natural lighting",
        text_content="SALE 50% OFF",
        size="1024x1024"
    )
    
    if result["success"]:
        print(f"生成成功！图片 URL: {result['image_url']}")
    else:
        print(f"生成失败：{result['error']}")
```

## 2. 抠图服务 (Python)

```python
# backend/app/services/background_remover.py

import requests
from rembg import remove
from PIL import Image
import io

class BackgroundRemover:
    """背景去除服务"""
    
    def remove_bg_rem_bg(self, image_path: str) -> str:
        """使用 rembg 本地服务抠图"""
        with open(image_path, 'rb') as f:
            input_image = f.read()
        
        output_image = remove(input_image)
        
        # 保存结果
        output_path = image_path.replace('.', '_nobg.')
        with open(output_path, 'wb') as f:
            f.write(output_image)
        
        return output_path
    
    def remove_bg_api(self, image_base64: str, api_key: str) -> dict:
        """使用阿里云图像分割 API"""
        url = "https://dashscope.aliyuncs.com/api/v1/services/vision/segmentation/image-segmentation"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "image-segmentation-v1",
            "input": {
                "image": image_base64
            }
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
```

## 3. PayPal 订阅集成 (React/TypeScript)

```typescript
// frontend/src/components/Payment/SubscriptionButtons.tsx

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: "month" | "year";
  generations: number;
}

const plans: SubscriptionPlan[] = [
  {
    id: "P-MONTHLY-PLAN-ID",
    name: "基础版",
    price: 9.9,
    period: "month",
    generations: 50
  },
  {
    id: "P-YEARLY-PLAN-ID",
    name: "基础版 (年付)",
    price: 99,
    period: "year",
    generations: 600
  }
];

export default function SubscriptionButtons() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(plans[0]);

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "YOUR_PAYPAL_CLIENT_ID",
        vault: true,
        intent: "subscription"
      }}
    >
      <div className="space-y-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan.id === plan.id
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <span className="text-3xl font-bold">
                ${plan.price}
                <span className="text-sm text-gray-600">/{plan.period}</span>
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              {plan.generations} 次生成/月
            </p>
            {selectedPlan.id === plan.id && (
              <PayPalButtons
                style={{ layout: "vertical", color: "blue" }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: plan.id
                  });
                }}
                onApprove={async (data, actions) => {
                  // 订阅成功，调用后端更新用户权限
                  const response = await fetch("/api/activate-subscription", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subscriptionId: data.subscriptionID,
                      plan: plan
                    })
                  });
                  
                  if (response.ok) {
                    alert("订阅成功！");
                    window.location.reload();
                  }
                }}
                onError={(err) => {
                  console.error("PayPal 错误:", err);
                  alert("支付失败，请重试");
                }}
              />
            )}
          </div>
        ))}
      </div>
    </PayPalScriptProvider>
  );
}
```

## 4. 前端编辑器页面 (简化版)

```typescript
// frontend/src/pages/editor.tsx

import { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text } from "react-konva";

export default function Editor() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [textLayers, setTextLayers] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!productImage || !prompt) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: productImage,
          prompt: prompt,
          text_layers: textLayers
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedImage(result.image_url);
      }
    } catch (error) {
      console.error("生成失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Poster Editor</h1>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !productImage}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isGenerating ? "生成中..." : "生成海报"}
        </button>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* 左侧面板 */}
        <div className="w-80 bg-white border-r p-4 space-y-4">
          {/* 上传区域 */}
          <div>
            <label className="block text-sm font-medium mb-2">产品图片</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setProductImage(e.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full"
            />
          </div>

          {/* 提示词输入 */}
          <div>
            <label className="block text-sm font-medium mb-2">背景描述</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., modern living room with soft lighting"
              className="w-full border rounded-lg p-2 h-24"
            />
          </div>

          {/* 文字图层列表 */}
          <div>
            <label className="block text-sm font-medium mb-2">文字图层</label>
            <button
              onClick={() => setTextLayers([...textLayers, {
                id: Date.now().toString(),
                text: "New Text",
                x: 100,
                y: 100,
                fontSize: 24,
                color: "#000000"
              }])}
              className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
            >
              + 添加文字
            </button>
          </div>
        </div>

        {/* 中间画布 */}
        <div className="flex-1 flex items-center justify-center p-8">
          {generatedImage ? (
            <Stage width={600} height={600}>
              <Layer>
                <KonvaImage
                  image={(() => {
                    const img = new window.Image();
                    img.src = generatedImage;
                    return img;
                  })()}
                  width={600}
                  height={600}
                />
                {textLayers.map((layer) => (
                  <Text
                    key={layer.id}
                    text={layer.text}
                    x={layer.x}
                    y={layer.y}
                    fontSize={layer.fontSize}
                    fill={layer.color}
                    draggable
                    onDragEnd={(e) => {
                      const updated = textLayers.map(l =>
                        l.id === layer.id
                          ? { ...l, x: e.target.x(), y: e.target.y() }
                          : l
                      );
                      setTextLayers(updated);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          ) : (
            <div className="text-gray-400">
              上传产品图片并输入描述后点击生成
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 环境变量配置

### 后端 (.env)

```bash
# API 密钥
QWEN_API_KEY=sk-your-dashscope-api-key
APIYI_API_KEY=your-apiyi-key

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/ai_poster_studio

# Redis
REDIS_URL=redis://localhost:6379

# 对象存储 (CloudFlare R2)
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET=ai-poster-studio

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_WEBHOOK_ID=your-webhook-id

# JWT
JWT_SECRET=your-super-secret-jwt-key
```

### 前端 (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```
