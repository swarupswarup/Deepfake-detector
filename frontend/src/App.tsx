import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Loader from './components/Loader';
import BackgroundManager from './components/BackgroundManager';
import StatusPage from './components/StatusPage';
import './App.css';

interface HealthStatus {
  success: boolean;
  data?: {
    status: string;
    services: {
      flask: boolean;
      cors: boolean;
      deepfake_detector: boolean;
      model_loaded: boolean;
    };
  };
  error?: string;
}

interface UploadResult {
  success: boolean;
  data?: {
    message: string;
    filename: string;
    upload_id: string;
  };
  error?: string;
}

interface AnalysisResult {
  success: boolean;
  data?: {
    result: {
      is_deepfake: boolean;
      confidence: number;
    };
  };
  error?: string;
}

function MainPage() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data: HealthStatus = await response.json();
      
      if (data.success && data.data?.status === 'healthy') {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setApiStatus('offline');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await handleAnalyze();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        success: false,
        error: 'Analysis failed: ' + (error as Error).message
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <BackgroundManager>
      <StyledApp>
        <TopNavigation>
          <LeftHeader>
            <CompactTitle>🛡️ Deepfake Detection</CompactTitle>
            <CompactSubtitle>Advanced AI-powered video authenticity analysis</CompactSubtitle>
          </LeftHeader>
          
          <RightStatus>
            <ConnectionStatus status={apiStatus}>
              {apiStatus === 'checking' && '🔄 Checking...'}
              {apiStatus === 'online' && 'ᑕᗝᑎᑎᗴᑕ丅ᗴᗪ'}
              {apiStatus === 'offline' && '❌ Offline'}
            </ConnectionStatus>
            <StatusButton onClick={() => navigate('/status')}>
              DIAGNOSTICS
            </StatusButton>
            {apiStatus === 'offline' && (
              <RetryButton onClick={checkApiHealth}>
                Retry
              </RetryButton>
            )}
          </RightStatus>
        </TopNavigation>
        
        <Container>
          {apiStatus === 'online' ? (
            <MainContent>
              <UploadSection>
                <SectionTitle>Upload Video for Analysis</SectionTitle>
                
                <FileInputContainer>
                  <FileInput
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    id="video-upload"
                  />
                  <FileInputLabel htmlFor="video-upload" hasFile={!!selectedFile}>
                    <div className="file-icon">📁</div>
                    <div className="file-text">
                      {selectedFile ? selectedFile.name : 'Choose Video File'}
                    </div>
                  </FileInputLabel>
                </FileInputContainer>

                {selectedFile && (
                  <UploadButton
                    onClick={handleUpload}
                    disabled={uploading || analyzing}
                  >
                    {uploading ? '⏳ Uploading...' : analyzing ? '🔍 Analyzing...' : '📤 Upload & Analyze'}
                  </UploadButton>
                )}

                {analyzing && (
                  <AnalysisContainer>
                    <LoaderContainer>
                      <Loader />
                    </LoaderContainer>
                    <AnalysisText>
                      <h3>🔍 Analyzing Video...</h3>
                      <p>Our AI model is processing your video frames for deepfake detection.</p>
                    </AnalysisText>
                  </AnalysisContainer>
                )}

                {analysisResult && !analyzing && (
                  <ResultContainer success={analysisResult.success}>
                    <ResultTitle>Analysis Complete</ResultTitle>
                    {analysisResult.success && analysisResult.data ? (
                      <ResultDetails>
                        <ResultCard isDeepfake={analysisResult.data.result.is_deepfake}>
                          <ResultIcon>
                            {analysisResult.data.result.is_deepfake ? '⚠️' : '✅'}
                          </ResultIcon>
                          <ResultText>
                            <h4>
                              {analysisResult.data.result.is_deepfake ? 'Deepfake Detected' : 'Authentic Video'}
                            </h4>
                            <ConfidenceDisplay>
                              <ConfidencePercentage>
                                {(analysisResult.data.result.confidence * 100).toFixed(1)}%
                              </ConfidencePercentage>
                              <ConfidenceLabel>Confidence</ConfidenceLabel>
                              <ConfidenceProgress 
                                confidence={analysisResult.data.result.confidence}
                                isDeepfake={analysisResult.data.result.is_deepfake}
                              />
                            </ConfidenceDisplay>
                          </ResultText>
                        </ResultCard>
                      </ResultDetails>
                    ) : (
                      <ErrorMessage>❌ {analysisResult.error}</ErrorMessage>
                    )}
                  </ResultContainer>
                )}
              </UploadSection>
            </MainContent>
          ) : (
            <OfflineContainer>
              <h2>Service Unavailable</h2>
              <p>The deepfake detection service is currently offline.</p>
              <p>Please make sure the backend server is running on port 5000.</p>
            </OfflineContainer>
          )}
        </Container>
      </StyledApp>
    </BackgroundManager>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </Router>
  );
}

// Styled Components (keeping all the original styles)
const StyledApp = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const TopNavigation = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

const LeftHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const CompactTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: "Advent Pro", sans-serif;
  font-optical-sizing: auto;
  font-variation-settings: "wdth" 100;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.01em;
`;

const CompactSubtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: "Ubuntu", sans-serif;
  font-weight: 400;
`;

const RightStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const ConnectionStatus = styled.div<{ status: string }>`
  font-size: 1.1rem;
  font-weight: 600;
  font-family: "Ubuntu", sans-serif;
  color: ${props => {
    switch (props.status) {
      case 'online': return '#22c55e';
      case 'offline': return '#ef4444';
      default: return '#3b82f6';
    }
  }};
  text-shadow: 0 0 10px currentColor;
`;

const StatusButton = styled.button`
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1rem;
  font-family: "Ubuntu", sans-serif;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
  }
`;

const RetryButton = styled(StatusButton)`
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 8rem 1rem 2rem;
  }
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadSection = styled.div`
  width: 100%;
  backdrop-filter: blur(40px) saturate(200%);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 28px;
  padding: 2.5rem;
  border: none;
  box-shadow: 
    0 20px 80px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  position: relative;
  aspect-ratio: 18/10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 28px;
    background: 
      radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0),
      linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
    background-size: 24px 24px, 100% 100%;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    aspect-ratio: 5/4;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  color: white;
  text-align: center;
  margin: 0 0 2rem 0;
  font-family: "Advent Pro", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-variation-settings: "wdth" 100;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin: 0 0 1.5rem 0;
  }
`;

const FileInputContainer = styled.div`
  margin-bottom: 2rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label<{ hasFile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  border: 2px dashed ${props => props.hasFile ? '#22c55e' : 'rgba(255, 255, 255, 0.4)'};
  border-radius: 16px;
  background: ${props => props.hasFile ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  .file-icon {
    font-size: 2rem;
  }
  
  .file-text {
    font-size: 1.1rem;
    font-family: "Ubuntu", sans-serif;
    font-weight: 500;
    text-align: center;
    word-break: break-all;
    letter-spacing: 0.01em;
  }
  
  &:hover {
    border-color: ${props => props.hasFile ? '#16a34a' : 'rgba(255, 255, 255, 0.6)'};
    background: ${props => props.hasFile ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
    
    .file-text {
      font-size: 1rem;
    }
  }
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  font-size: 1.1rem;
  font-family: "Ubuntu", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 32px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  letter-spacing: 0.01em;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1);
    box-shadow: 
      0 12px 48px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  padding: 2.5rem 2rem;
  backdrop-filter: blur(40px) saturate(200%);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: none;
  margin: 1.5rem 0;
  box-shadow: 
    0 16px 64px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background: 
      radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0),
      linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    background-size: 20px 20px, 100% 100%;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const LoaderContainer = styled.div`
  z-index: 2;
  position: relative;
  flex-shrink: 0;
`;

const AnalysisText = styled.div`
  text-align: left;
  color: white;
  z-index: 2;
  flex: 1;
  
  h3 {
    font-size: 1.6rem;
    margin: 0 0 1rem 0;
    font-family: "Advent Pro", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-variation-settings: "wdth" 100;
    letter-spacing: -0.01em;
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
    font-family: "Ubuntu", sans-serif;
    font-weight: 400;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ResultContainer = styled.div<{ success: boolean }>`
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
`;

const ResultTitle = styled.h3`
  color: white;
  text-align: center;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: "Advent Pro", sans-serif;
`;

const ResultDetails = styled.div`
  display: flex;
  justify-content: center;
`;

const ResultCard = styled.div<{ isDeepfake: boolean }>`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: ${props => props.isDeepfake ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'};
  border: 1px solid ${props => props.isDeepfake ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
  backdrop-filter: blur(10px);
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const ResultIcon = styled.div`
  font-size: 3rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ResultText = styled.div`
  color: white;
  flex: 1;
  
  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: 600;
    font-family: "Advent Pro", sans-serif;
  }
`;

const ConfidenceDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ConfidencePercentage = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  font-family: "Advent Pro", sans-serif;
  text-align: center;
  margin-bottom: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    padding: 0.8rem 1.5rem;
  }
`;

const ConfidenceLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  font-family: "Ubuntu", sans-serif;
  text-align: center;
  opacity: 0.8;
`;

const ConfidenceProgress = styled.div<{ confidence: number; isDeepfake: boolean }>`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin-top: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.confidence * 100}%;
    background: ${props => props.isDeepfake ? 
      'linear-gradient(90deg, #ef4444, #dc2626)' : 
      'linear-gradient(90deg, #22c55e, #16a34a)'};
    border-radius: 6px;
    transition: width 0.5s ease;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 1.1rem;
  margin: 0;
  font-family: "Ubuntu", sans-serif;
`;

const OfflineContainer = styled.div`
  text-align: center;
  color: white;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  h2 {
    font-size: 2rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
    font-family: "Advent Pro", sans-serif;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0.5rem 0;
    opacity: 0.9;
    font-family: "Ubuntu", sans-serif;
  }
`;

export default App;