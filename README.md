# 🛡️ Deepfake Detection App

An advanced web application that detects deepfake content in uploaded videos using AI-powered analysis with real-time monitoring and diagnostics. Features a stunning 3D animated background with customizable beam effects and a modern glassmorphism UI.

## ✨ Features

- 🎥 **Video Analysis**: Upload and analyze videos for deepfake detection with confidence scoring
- 🔍 **Real-time Status**: Live health monitoring and comprehensive system diagnostics
- 📊 **Timeline Visualization**: Animated 5-step progress tracking for model testing pipeline
- 🎨 **Modern UI**: Stylish React interface with glassmorphism design and 3D effects
- 🌟 **3D Background**: Customizable animated beam effects using React Three Fiber
- 🤖 **AI-Powered**: Uses custom Hugging Face transformer models for deepfake detection
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🧪 **Testing Suite**: Comprehensive Jest tests with mocked API interactions
- 🔧 **Diagnostics**: Advanced model testing and debugging capabilities

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (3.9+ recommended)
- **Node.js 16+** (18+ recommended)
- **Hugging Face account** and access token
- **Git** for cloning the repository
- **4GB+ RAM** for model loading
- **Stable internet connection** for initial model download

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd deepfake-defender/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install all required dependencies
pip install -r requirements.txt

# Configure environment variables
echo "HUGGINGFACE_TOKEN=your_token_here" > .env
echo "MODEL_NAME=Naman712/Deep-fake-detection" >> .env
echo "FLASK_DEBUG=1" >> .env

# Test model loading (optional but recommended)
python debug_hf_model.py

# Start the backend server
python app.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install all Node.js dependencies
npm install

# Start development server
npm start

# Optional: Run tests
npm test

# Optional: Build for production
npm run build
```

## 🎯 Complete User Flow

### 1. **Application Launch & Initialization**
- **Backend**: Starts on `http://localhost:5000` with Flask server
- **Frontend**: Starts on `http://localhost:3000` with React development server
- **3D Background**: Animated beam effects initialize with custom parameters:
  - Beam Width: 3px
  - Beam Height: 30px  
  - Beam Count: 20 beams
  - Animation Speed: 2x
  - Noise Intensity: 1.75
  - Rotation: 30 degrees
- **Health Check**: Automatic backend connectivity verification every 5 seconds

### 2. **Main Interface** (`/`) - Primary User Experience
- **Header Section**:
  - 🛡️ **Title**: "Deepfake Detection" with modern typography
  - **Subtitle**: "Advanced AI-powered video authenticity analysis"
  - **Connection Status**: Live indicator (🔄 Checking... → ᑕᗝᑎᑎᗴᑕ丅ᗴᗪ → ❌ Offline)
  - **DIAGNOSTICS Button**: Enhanced button for quick access to status page

- **Upload Section** (when online):
  - **Glassmorphism Card**: Translucent container with blur effects
  - **File Input**: Drag & drop or click interface with visual feedback
  - **Supported Formats**: All common video formats (MP4, AVI, MOV, etc.)
  - **Upload & Analyze Button**: Single-click processing with loading states

- **Analysis Display**:
  - **Loading Animation**: Custom spinner with progress text
  - **Results Card**: Color-coded results (Green = Authentic, Red = Deepfake)
  - **Confidence Meter**: Animated progress bar with percentage
  - **Visual Indicators**: Icons and color schemes for quick understanding

### 3. **Diagnostics Page** (`/status`) - Advanced Monitoring
- **Header**: "🔧 System Diagnostics" with subtitle
- **Two-Column Layout**:
  
  **Left Column - Model Testing Pipeline**:
  - **Run Diagnostics Button**: Triggers comprehensive 5-step testing
  - **Animated Timeline**: Growing progress line with step indicators
  - **Step-by-Step Process**:
    1. 🔧 **Environment Check**: Validates Hugging Face token and configuration
    2. 🌐 **Repository Access**: Tests model repository connectivity
    3. 📥 **Model Download**: Downloads and caches model files (first run)
    4. 🔧 **Module Import**: Imports custom model and processor classes
    5. 🤖 **Model Loading**: Full model initialization and readiness test
  - **Visual Feedback**: Each step shows pending → running → success/error states
  - **Error Details**: Specific error messages and troubleshooting hints

  **Right Column - Live Health Monitor**:
  - **Real-time Status**: Updates every 5 seconds
  - **Service Breakdown**:
    - ✅ Flask Server (Backend API)
    - ✅ CORS Configuration (Cross-origin requests)
    - ✅ Deepfake Detector (Model availability)
    - ✅ Model Loaded (Ready for inference)
  - **Last Updated**: Timestamp of latest health check

### 4. **Video Analysis Workflow**
1. **File Selection**: 
   - User selects video file via file picker or drag-drop
   - File validation and size checking
   - Visual confirmation with filename display

2. **Upload Process**:
   - FormData creation with video file
   - POST request to `/analyze` endpoint
   - Real-time upload progress (if implemented)

3. **Backend Processing**:
   - Video frame extraction (up to 20 frames)
   - Frame preprocessing (resize to 112x112, normalization)
   - Model inference on frame sequence
   - Result aggregation and confidence calculation

4. **Results Display**:
   - **Authentic Video**: Green card with ✅ icon and confidence percentage
   - **Deepfake Detected**: Red card with ⚠️ icon and confidence percentage
   - **Confidence Visualization**: Animated progress bar
   - **Error Handling**: Clear error messages for failed analyses

### 5. **Error States & Recovery**
- **Backend Offline**: 
  - Shows "Service Unavailable" message
  - Provides troubleshooting instructions
  - Retry button for reconnection attempts
  
- **Model Loading Issues**:
  - Diagnostics page shows specific failure points
  - Detailed error messages in timeline
  - Suggestions for token validation and network checks

- **Upload Failures**:
  - File format validation errors
  - Network timeout handling
  - Clear user feedback with retry options

### 6. **Responsive Design Breakpoints**
- **Desktop** (1024px+): Full two-column layout
- **Tablet** (768px-1024px): Stacked layout with adjusted spacing
- **Mobile** (< 768px): Single column, touch-optimized interface

## 🔧 Configuration

### Environment Variables (`backend/.env`)
```env
# Required: Your Hugging Face authentication token
HUGGINGFACE_TOKEN=your_token_here_replace_this

# Optional: Model configuration
MODEL_NAME=Naman712/Deep-fake-detection
FLASK_DEBUG=1
SECRET_KEY=your-secret-key
```

### Getting Your Hugging Face Token
1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token to your `.env` file

## 📦 Dependencies & Packages

### Backend Dependencies (`requirements.txt`)
```txt
# Core Flask Framework
flask>=2.3.0                 # Web framework
flask-cors>=4.0.0            # Cross-origin resource sharing

# Machine Learning & AI
torch>=2.6.0                 # PyTorch deep learning framework
transformers>=4.40.0         # Hugging Face transformers
huggingface-hub>=0.17.0      # Model hub integration
opencv-python>=4.8.0         # Computer vision library
pillow>=10.0.0               # Image processing
numpy>=1.24.0                # Numerical computing

# Utilities
python-dotenv>=1.0.0         # Environment variable management
```

### Frontend Dependencies (`package.json`)
```json
{
  "dependencies": {
    // Core React Framework
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.0",
    "react-scripts": "5.0.1",
    
    // 3D Graphics & Animation
    "@react-three/fiber": "^9.3.0",    // React Three.js renderer
    "@react-three/drei": "^10.6.1",    // Three.js helpers
    "three": "^0.179.1",               // 3D graphics library
    
    // Styling & UI
    "styled-components": "^6.1.19",    // CSS-in-JS styling
    
    // HTTP & API
    "axios": "^1.11.0",               // HTTP client
    
    // TypeScript Support
    "typescript": "^4.9.5",
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "@types/react-router-dom": "^5.3.3",
    "@types/styled-components": "^5.1.34",
    
    // Testing Framework
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/user-event": "^14.6.1",
    "msw": "^2.10.4"                  // Mock service worker
  }
}
```

## 📁 Project Structure

```
deepfake-defender/
├── backend/                         # Flask API Server
│   ├── app.py                      # Main Flask application with all routes
│   ├── debug_hf_model.py           # Model diagnostics and testing script
│   ├── correct_model.py            # Custom model architecture definitions
│   ├── simple_processor.py         # Video frame processing utilities
│   ├── requirements.txt            # Python dependencies list
│   ├── .env                        # Environment variables (create this)
│   ├── model_cache/                # Cached Hugging Face model files
│   └── venv/                       # Python virtual environment
├── frontend/                        # React Application
│   ├── src/
│   │   ├── App.tsx                 # Main app with routing and health checks
│   │   ├── App.test.tsx            # Comprehensive Jest tests
│   │   ├── App.css                 # Global styles and fonts
│   │   ├── index.tsx               # React entry point
│   │   └── components/
│   │       ├── StatusPage.tsx      # Diagnostics & monitoring interface
│   │       ├── BackgroundManager.tsx # 3D background effect manager
│   │       ├── Beams.tsx           # Complex 3D beam animations
│   │       ├── SimpleBeams.tsx     # Fallback 2D beam animations
│   │       ├── Beams.css           # Beam-specific styles
│   │       └── Loader.tsx          # Loading animation component
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   ├── bg.jpg                  # Fallback background image (optional)
│   │   └── favicon.ico             # App icon
│   ├── package.json                # Node.js dependencies and scripts
│   └── node_modules/               # Installed npm packages
├── README.md                       # This comprehensive documentation
└── .gitignore                      # Git ignore patterns
```

## 🤖 AI Model Details

### Model Information
- **Name**: `Naman712/Deep-fake-detection`
- **Type**: Custom PyTorch model for video analysis
- **Architecture**: Sequence-based deepfake detector
- **Input**: 20 video frames (112x112 pixels)
- **Output**: Binary classification (Real/Fake) with confidence

### Model Pipeline
1. **Frame Extraction**: Extract evenly distributed frames from video
2. **Preprocessing**: Resize and normalize frames to 112x112
3. **Sequence Processing**: Analyze 20-frame sequences
4. **Classification**: Binary output with confidence scores
5. **Result Aggregation**: Final deepfake probability

## 🌐 API Endpoints

### Backend Routes
- `GET /` - API information and status
- `GET /health` - Comprehensive health check
- `POST /analyze` - Video analysis endpoint
- `POST /debug-model` - Model diagnostics testing
- `POST /upload` - File upload (legacy)

### Frontend Routes
- `/` - Main application interface
- `/status` - System diagnostics and monitoring

## 🎨 UI/UX Features & Styling

### Design System
- **Glassmorphism**: Modern translucent cards with backdrop blur effects
- **3D Background**: Customizable animated beam system with WebGL fallbacks
- **Typography**: 
  - Headers: "Advent Pro" font family with optical sizing
  - Body: "Ubuntu" font family for readability
- **Color Palette**:
  - Success: #22c55e (Green)
  - Error: #ef4444 (Red) 
  - Info: #3b82f6 (Blue)
  - Background: Dynamic gradients with transparency
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### 3D Background Configuration
```typescript
// Current beam settings (customizable)
beamWidth: 3,           // Beam thickness
beamHeight: 30,         // Beam length
beamCount: 20,          // Number of beams
speed: 2,               // Animation speed
noiseIntensity: 1.75,   // Visual noise effect
scale: 0.2,             // Noise scale
rotation: 30            // Beam rotation angle
```

### Animation System
- **Loading States**: Custom spinners with contextual messages
- **Transitions**: Smooth 0.3s ease transitions throughout
- **Hover Effects**: Subtle transform and shadow changes
- **Progress Indicators**: Animated progress bars and timelines
- **Error Animations**: Shake effects and color transitions

### Accessibility Features
- **Keyboard Navigation**: Full tab-based navigation support
- **Screen Reader**: Comprehensive ARIA labels and semantic HTML
- **High Contrast**: Clear visual hierarchy with sufficient color contrast
- **Error States**: Descriptive error messages with recovery instructions
- **Focus Indicators**: Clear focus outlines for interactive elements
- **Reduced Motion**: Respects user's motion preferences

## 🔍 Troubleshooting

### Common Issues

**Backend Won't Start**
```bash
# Check Python version
python --version  # Should be 3.8+

# Verify dependencies
pip install -r requirements.txt

# Check Hugging Face token
python -c "import os; print(os.getenv('HUGGINGFACE_TOKEN'))"
```

**Model Loading Fails**
- Verify Hugging Face token is valid
- Check internet connection
- Run diagnostics: `python debug_hf_model.py`

**Frontend Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 16+
```

**Connection Issues**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify firewall settings

## 🚀 Deployment

### Development
```bash
# Terminal 1: Backend
cd backend && python app.py

# Terminal 2: Frontend  
cd frontend && npm start
```

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Serve with backend
cd backend && python app.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Hugging Face for model hosting
- React Three Fiber for 3D effects
- Styled Components for styling
- OpenCV for video processing


## ✍️ Author

```
███╗   ███╗ █████╗ ██████╗ ███████╗    ██████╗ ██╗   ██╗    ███╗   ██╗ █████╗ ███╗   ███╗ █████╗ ███╗   ██╗
████╗ ████║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗╚██╗ ██╔╝    ████╗  ██║██╔══██╗████╗ ████║██╔══██╗████╗  ██║
██╔████╔██║███████║██║  ██║█████╗      ██████╔╝ ╚████╔╝     ██╔██╗ ██║███████║██╔████╔██║███████║██╔██╗ ██║
██║╚██╔╝██║██╔══██║██║  ██║██╔══╝      ██╔══██╗  ╚██╔╝      ██║╚██╗██║██╔══██║██║╚██╔╝██║██╔══██║██║╚██╗██║
██║ ╚═╝ ██║██║  ██║██████╔╝███████╗    ██████╔╝   ██║       ██║ ╚████║██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝    ╚═════╝    ╚═╝       ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```
