#!/usr/bin/env python3
"""
Debug script to test Hugging Face model loading , TEST TO SEE ALL WORKING LOAD, DOWNLOADE,ETC.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment
load_dotenv()

def debug_hf_model():
    print("🔍 Debugging Hugging Face Model Loading...")
    print("=" * 60)
    
    # Check environment
    model_name = os.getenv('MODEL_NAME', 'Naman712/Deep-fake-detection')
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    
    print(f"Model name: {model_name}")
    print(f"Token available: {'Yes' if hf_token and hf_token != 'your_token_here_replace_this' else 'No'}")
    
    if not hf_token or hf_token == 'your_token_here_replace_this':
        print("❌ No valid Hugging Face token!")
        return False
    
    # Test 1: Check if we can access the repo
    print(f"\n🧪 Test 1: Accessing repository...")
    try:
        from huggingface_hub import HfApi
        api = HfApi()
        
        # List files in the repo
        files = api.list_repo_files(repo_id=model_name, token=hf_token)
        print(f"✅ Repository accessible")
        print(f"Files in repo: {files}")
        
    except Exception as e:
        print(f"❌ Cannot access repository: {e}")
        return False
    
    # Test 2: Try downloading files
    print(f"\n🧪 Test 2: Downloading model files...")
    try:
        from huggingface_hub import hf_hub_download
        
        current_dir = Path(__file__).parent
        cache_dir = os.path.join(current_dir, 'model_cache')
        os.makedirs(cache_dir, exist_ok=True)
        
        files_to_download = [
            'modeling_deepfake.py',
            'processor_deepfake.py', 
            'model_87_acc_20_frames_final_data.pt',
            'config.json'
        ]
        
        downloaded_files = {}
        for filename in files_to_download:
            try:
                print(f"Downloading {filename}...")
                file_path = hf_hub_download(
                    repo_id=model_name,
                    filename=filename,
                    token=hf_token,
                    local_dir=cache_dir,
                    local_dir_use_symlinks=False
                )
                downloaded_files[filename] = file_path
                print(f"✅ Downloaded {filename}")
                
            except Exception as file_error:
                print(f"❌ Failed to download {filename}: {file_error}")
                return False
        
        print(f"✅ All files downloaded to: {cache_dir}")
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False
    
    # Test 3: Try importing custom modules
    print(f"\n🧪 Test 3: Importing custom modules...")
    try:
        sys.path.insert(0, cache_dir)
        
        from modeling_deepfake import DeepFakeDetectorModel, DeepFakeDetectorConfig
        print("✅ DeepFakeDetectorModel imported successfully")
        
        # Try original processor, fallback to simple one
        try:
            from processor_deepfake import DeepFakeProcessor
            processor_class = DeepFakeProcessor
            print("✅ Original DeepFakeProcessor imported successfully")
        except ImportError as e:
            print(f"⚠️ Original processor failed: {e}")
            print("Using simplified processor...")
            sys.path.insert(0, str(Path(__file__).parent))
            from simple_processor import SimpleDeepFakeProcessor
            processor_class = SimpleDeepFakeProcessor
            print("✅ SimpleDeepFakeProcessor imported successfully")
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        print(f"Available files in cache: {os.listdir(cache_dir)}")
        return False
    
    # Test 4: Try loading the model
    print(f"\n🧪 Test 4: Loading model...")
    try:
        import torch
        
        model_path = downloaded_files['model_87_acc_20_frames_final_data.pt']
        
        # Try original model first
        try:
            from modeling_deepfake import DeepFakeDetectorModel
            model = DeepFakeDetectorModel.from_pretrained(model_path)
            print("✅ Original complex model loaded successfully")
        except Exception as model_error:
            print(f"⚠️ Original model failed: {model_error}")
            print("Trying correct model architecture...")
            
            # Add current directory to path for correct_model
            sys.path.insert(0, str(Path(__file__).parent))
            from correct_model import DeepFakeDetector
            model = DeepFakeDetector.load_from_file(model_path)
            print("✅ Correct model architecture loaded successfully")
        
        model.eval()
        
        # Initialize processor
        processor = processor_class()
        print("✅ Processor initialized")
        
        print("🎉 Model loading test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return False

if __name__ == "__main__":
    success = debug_hf_model()
    print("\n" + "=" * 60)
    if success:
        print("✅ All tests PASSED - Model should work in main app")
    else:
        print("❌ Some tests FAILED - Check the errors above")