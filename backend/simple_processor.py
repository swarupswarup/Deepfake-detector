"""
Simplified processor that doesn't require face_recognition
"""
import numpy as np
import torch
from PIL import Image

class SimpleDeepFakeProcessor:
    """Simplified processor for DeepFake detection model without face detection."""
    
    def __init__(self, im_size=112, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]):
        self.im_size = im_size
        self.mean = mean
        self.std = std
    
    def preprocess_frame(self, frame):
        """
        Preprocess a single frame.
        
        Args:
            frame: PIL Image or numpy array
            
        Returns:
            torch.Tensor: Processed frame tensor
        """
        # Convert to PIL Image if it's a numpy array
        if isinstance(frame, np.ndarray):
            frame = Image.fromarray(frame)
        
        # Resize to square
        frame = frame.resize((self.im_size, self.im_size))
        
        # Convert to tensor
        frame = np.array(frame).astype(np.float32) / 255.0
        frame = (frame - np.array(self.mean)) / np.array(self.std)
        frame = frame.transpose(2, 0, 1)  # HWC -> CHW
        frame = torch.tensor(frame, dtype=torch.float32)
        
        return frame
    
    def __call__(self, frames=None, return_tensors="pt", **kwargs):
        """
        Process frames for the model.
        
        Args:
            frames: List of frames (PIL Images or numpy arrays)
            return_tensors: Return format (only "pt" supported)
            
        Returns:
            dict: Processed inputs for the model
        """
        if return_tensors != "pt":
            raise ValueError("Only 'pt' return tensors are supported")
        
        if frames is None:
            raise ValueError("frames must be provided")
        
        # Process provided frames
        processed_frames = torch.stack([self.preprocess_frame(frame) for frame in frames])
        processed_frames = processed_frames.unsqueeze(0)  # Add batch dimension
        
        return {"pixel_values": processed_frames}