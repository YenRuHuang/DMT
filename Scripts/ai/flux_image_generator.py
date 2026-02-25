
#!/usr/bin/env python3
"""
Flux.1 圖像生成器
適用於社群內容製作

使用方式:
    python3 flux_image_generator.py "你的提示詞"
    python3 flux_image_generator.py "你的提示詞" --output "output.png"
"""

import argparse
import torch
from diffusers import FluxPipeline
from datetime import datetime
import os

def generate_image(
    prompt: str,
    output_path: str = None,
    num_inference_steps: int = 50,
    guidance_scale: float = 3.5,
    width: int = 1024,
    height: int = 1024,
    seed: int = None
):
    """
    使用 Flux.1-dev 生成圖像
    
    Args:
        prompt: 圖像描述提示詞
        output_path: 輸出路徑
        num_inference_steps: 推理步數 (越高品質越好，但更慢)
        guidance_scale: 引導強度
        width: 圖像寬度
        height: 圖像高度
        seed: 隨機種子 (用於復現結果)
    """
    print("🚀 載入 Flux.1-dev 模型...")
    print("   (首次執行會下載約 23GB 模型檔案，請耐心等待)")
    
    # 載入模型，使用 bfloat16 以節省記憶體
    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-dev",
        torch_dtype=torch.bfloat16
    )
    
    # 在 Apple Silicon Mac 上使用 MPS 加速
    if torch.backends.mps.is_available():
        print("✅ 使用 Apple MPS 加速")
        pipe = pipe.to("mps")
    else:
        print("ℹ️  使用 CPU 運算")
        pipe = pipe.to("cpu")
    
    # 啟用記憶體優化
    pipe.enable_attention_slicing()
    
    # 設定隨機種子
    generator = None
    if seed is not None:
        generator = torch.Generator().manual_seed(seed)
        print(f"🎲 使用種子: {seed}")
    
    print(f"\n📝 提示詞: {prompt}")
    print(f"🖼️  尺寸: {width}x{height}")
    print(f"🔄 推理步數: {num_inference_steps}")
    print("\n⏳ 生成中...")
    
    # 生成圖像
    image = pipe(
        prompt=prompt,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        width=width,
        height=height,
        generator=generator
    ).images[0]
    
    # 設定輸出路徑
    if output_path is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(output_dir, f"flux_output_{timestamp}.png")
    
    # 確保輸出目錄存在
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # 儲存圖像
    image.save(output_path)
    print(f"\n✅ 圖像已儲存: {output_path}")
    
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Flux.1 圖像生成器")
    parser.add_argument("prompt", type=str, help="圖像描述提示詞")
    parser.add_argument("--output", "-o", type=str, default=None, help="輸出路徑")
    parser.add_argument("--steps", "-s", type=int, default=50, help="推理步數 (預設: 50)")
    parser.add_argument("--guidance", "-g", type=float, default=3.5, help="引導強度 (預設: 3.5)")
    parser.add_argument("--width", "-W", type=int, default=1024, help="圖像寬度 (預設: 1024)")
    parser.add_argument("--height", "-H", type=int, default=1024, help="圖像高度 (預設: 1024)")
    parser.add_argument("--seed", type=int, default=None, help="隨機種子")
    
    args = parser.parse_args()
    
    generate_image(
        prompt=args.prompt,
        output_path=args.output,
        num_inference_steps=args.steps,
        guidance_scale=args.guidance,
        width=args.width,
        height=args.height,
        seed=args.seed
    )


if __name__ == "__main__":
    main()
