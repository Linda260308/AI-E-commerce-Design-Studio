"""
Qwen Image 2.0 API Service
用于 AI 电商海报生成
"""
import aiohttp
import base64
from typing import Optional, Dict, Any
from PIL import Image
import io

class QwenImageService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # 阿里云 DashScope API 端点
        self.base_url = "https://dashscope.aliyuncs.com/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def generate_poster(
        self,
        image_base64: str,
        prompt: str,
        text_content: Optional[str] = None,
        font_style: str = "modern",
        color_scheme: str = "#8B5CF6",
        size: str = "1024x1024"
    ) -> Dict[str, Any]:
        """
        使用 Qwen-image-2.0 生成海报
        
        Args:
            image_base64: 产品图片的 base64 编码
            prompt: 背景风格描述
            text_content: 要添加的文字内容
            font_style: 字体样式
            color_scheme: 颜色方案
            size: 输出尺寸
            
        Returns:
            生成结果，包含图片 URL 或 base64
        """
        try:
            # 构建完整的提示词
            full_prompt = self._build_prompt(prompt, text_content, font_style, color_scheme)
            
            # 调用 Qwen-image-2.0 API
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "qwen-image-2.0",
                    "prompt": full_prompt,
                    "size": size,
                    "n": 1
                }
                
                # 如果有参考图片，添加到请求中
                if image_base64:
                    payload["image"] = image_base64
                
                async with session.post(
                    f"{self.base_url}/services/aigc/text2image/image-synthesis",
                    headers=self.headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "image_url": result.get("output", {}).get("results", [{}])[0].get("url"),
                            "generation_id": result.get("request_id", ""),
                            "text_editable": True
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"API 请求失败：{response.status}",
                            "details": error_text
                        }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _build_prompt(
        self,
        base_prompt: str,
        text_content: Optional[str],
        font_style: str,
        color_scheme: str
    ) -> str:
        """
        构建完整的 AI 提示词
        
        包含：
        - 背景风格描述
        - 文字内容
        - 字体和颜色要求
        - 电商海报专业术语
        """
        prompt_parts = [
            "professional e-commerce product poster,",
            "high quality, 4k resolution,",
            "studio lighting,",
            base_prompt
        ]
        
        # 添加文字内容
        if text_content:
            prompt_parts.append(f"text overlay: '{text_content}'")
            
            # 字体样式映射
            font_descriptions = {
                "modern": "modern sans-serif font, clean and minimal",
                "elegant": "elegant serif font, sophisticated",
                "bold": "bold heavy font, eye-catching",
                "creative": "creative artistic font, unique design",
                "handwriting": "handwriting style font, personal touch",
                "tech": "futuristic tech font, digital style",
                "luxury": "luxury premium font, gold accents",
                "cute": "cute playful font, friendly"
            }
            prompt_parts.append(font_descriptions.get(font_style, "modern font"))
            
            # 颜色描述
            prompt_parts.append(f"text color: {color_scheme}")
        
        # 添加电商海报优化术语
        prompt_parts.extend([
            "commercial photography,",
            "product showcase,",
            "marketing material,",
            "clean composition,",
            "professional design"
        ])
        
        return ", ".join(prompt_parts)
    
    async def remove_background(self, image_base64: str) -> Dict[str, Any]:
        """
        使用 Qwen 或其他服务去除背景
        这里可以使用阿里云的图像分割服务
        """
        try:
            async with aiohttp.ClientSession() as session:
                # 使用阿里云图像分割 API
                payload = {
                    "image": image_base64,
                    "model": "image-segmentation-v1"
                }
                
                async with session.post(
                    f"{self.base_url}/services/aigc/image-segmentation",
                    headers=self.headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "image_base64": result.get("output", {}).get("image")
                        }
                    else:
                        # 降级使用 rembg
                        return await self._remove_background_local(image_base64)
        
        except Exception as e:
            return await self._remove_background_local(image_base64)
    
    async def _remove_background_local(self, image_base64: str) -> Dict[str, Any]:
        """
        本地使用 rembg 去除背景（备用方案）
        """
        try:
            from rembg import remove
            
            # 解码 base64 图片
            image_data = base64.b64decode(image_base64)
            input_image = Image.open(io.BytesIO(image_data))
            
            # 去除背景
            output_image = remove(input_image)
            
            # 转回 base64
            output_buffer = io.BytesIO()
            output_image.save(output_buffer, format="PNG")
            output_buffer.seek(0)
            result_base64 = base64.b64encode(output_buffer.getvalue()).decode()
            
            return {
                "success": True,
                "image_base64": result_base64
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
