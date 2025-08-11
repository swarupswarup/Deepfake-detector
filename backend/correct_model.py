"""
Correct model architecture that matches the trained weights
"""
import torch
import torch.nn as nn
import torchvision.models as models

class DeepFakeDetector(nn.Module):
    def __init__(self, num_classes=2, latent_dim=2048, lstm_layers=1, hidden_dim=2048, bidirectional=False):
        super(DeepFakeDetector, self).__init__()
        # Use the exact same architecture as the original
        model = models.resnext50_32x4d(weights='IMAGENET1K_V1')  # Updated parameter name
        self.model = nn.Sequential(*list(model.children())[:-2])
        self.lstm = nn.LSTM(latent_dim, hidden_dim, lstm_layers, bidirectional)
        self.relu = nn.LeakyReLU()
        self.dp = nn.Dropout(0.4)
        self.linear1 = nn.Linear(2048, num_classes)  # Note: linear1, not classifier
        self.avgpool = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        batch_size, seq_length, c, h, w = x.shape
        x = x.view(batch_size * seq_length, c, h, w)
        fmap = self.model(x)
        x = self.avgpool(fmap)
        x = x.view(batch_size, seq_length, 2048)
        x_lstm, _ = self.lstm(x, None)
        return fmap, self.dp(self.linear1(x_lstm[:, -1, :]))

    @classmethod
    def load_from_file(cls, model_path, **kwargs):
        """Load model from a .pt file with correct architecture."""
        # Create model with exact same parameters as training
        model = cls(
            num_classes=kwargs.get('num_classes', 2),
            latent_dim=kwargs.get('latent_dim', 2048),
            lstm_layers=kwargs.get('lstm_layers', 1),
            hidden_dim=kwargs.get('hidden_dim', 2048),
            bidirectional=kwargs.get('bidirectional', False)
        )
        
        # Load weights
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict)
        model.eval()
        
        return model