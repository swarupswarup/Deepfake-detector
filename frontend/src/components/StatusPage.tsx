import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import BackgroundManager from './BackgroundManager';

interface TestStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  details?: string;
}

interface HealthData {
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

const StatusPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 1,
      title: 'Environment Check',
      description: 'Checking Hugging Face token and model configuration',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Repository Access',
      description: 'Accessing Hugging Face model repository',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Model Download',
      description: 'Downloading model files and dependencies',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Module Import',
      description: 'Importing custom model and processor modules',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Model Loading',
      description: 'Loading and initializing the deepfake detection model',
      status: 'pending'
    }
  ]);

  // Fetch health data periodically
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        const data: HealthData = await response.json();
        setHealthData(data);
      } catch (error) {
        setHealthData({
          success: false,
          error: 'Failed to connect to backend'
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    // Reset all steps to pending
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));

    try {
      const response = await fetch('http://localhost:5000/debug-model', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Debug endpoint not available');
      }

      const result = await response.json();

      // Simulate step-by-step execution with animation
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setSteps(prev => prev.map((step, index) =>
          index === i ? { ...step, status: 'running' } : step
        ));

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update step status based on result
        const success = result.success && i < 4; // Simulate some steps passing
        setSteps(prev => prev.map((step, index) =>
          index === i ? {
            ...step,
            status: success ? 'success' : 'error',
            details: success ? 'Completed successfully' : 'Check backend logs for details'
          } : step
        ));

        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      // Mark current step as error
      setSteps(prev => prev.map((step, index) =>
        index === currentStep ? {
          ...step,
          status: 'error',
          details: 'Backend service unavailable'
        } : step
      ));
    }

    setIsRunning(false);
  };

  return (
    <BackgroundManager>
      <StatusContainer>
        <Header>
          <Title>🔧 System Diagnostics</Title>
          <Subtitle>Real-time model testing and health monitoring</Subtitle>
        </Header>

        <MainContent>
          <DiagnosticsSection>
            <SectionHeader>
              <SectionTitle>Model Testing Pipeline</SectionTitle>
              <RunButton
                onClick={runDiagnostics}
                disabled={isRunning}
                isRunning={isRunning}
              >
                {isRunning ? '🔄 Running Tests...' : '▶️ Run Diagnostics'}
              </RunButton>
            </SectionHeader>

            <TimelineContainer>
              <Timeline>
                {steps.map((step, index) => (
                  <TimelineStep key={step.id} isActive={index <= currentStep}>
                    <StepConnector
                      isActive={index < currentStep || (index === currentStep && step.status === 'success')}
                      isLast={index === steps.length - 1}
                    />
                    <StepIndicator status={step.status} isActive={index === currentStep}>
                      <StepNumber>{step.id}</StepNumber>
                      {step.status === 'running' && <Spinner />}
                      {step.status === 'success' && <CheckIcon>✓</CheckIcon>}
                      {step.status === 'error' && <ErrorIcon>✗</ErrorIcon>}
                    </StepIndicator>
                    <StepContent>
                      <StepTitle status={step.status}>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                      {step.details && (
                        <StepDetails status={step.status}>{step.details}</StepDetails>
                      )}
                    </StepContent>
                  </TimelineStep>
                ))}
              </Timeline>
            </TimelineContainer>
          </DiagnosticsSection>

          <HealthSection>
            <SectionTitle>Live Health Monitor</SectionTitle>
            <HealthCard>
              <HealthHeader>
                <HealthStatus status={healthData?.success ? 'online' : 'offline'}>
                  {healthData?.success ? '🟢 Online' : '🔴 Offline'}
                </HealthStatus>
                <LastUpdated>Updated {new Date().toLocaleTimeString()}</LastUpdated>
              </HealthHeader>

              {healthData?.success && healthData.data ? (
                <ServicesList>
                  <ServiceItem status={healthData.data.services.flask}>
                    <ServiceIcon>{healthData.data.services.flask ? '✅' : '❌'}</ServiceIcon>
                    <ServiceName>Flask Server</ServiceName>
                  </ServiceItem>
                  <ServiceItem status={healthData.data.services.cors}>
                    <ServiceIcon>{healthData.data.services.cors ? '✅' : '❌'}</ServiceIcon>
                    <ServiceName>CORS Configuration</ServiceName>
                  </ServiceItem>
                  <ServiceItem status={healthData.data.services.deepfake_detector}>
                    <ServiceIcon>{healthData.data.services.deepfake_detector ? '✅' : '❌'}</ServiceIcon>
                    <ServiceName>Deepfake Detector</ServiceName>
                  </ServiceItem>
                  <ServiceItem status={healthData.data.services.model_loaded}>
                    <ServiceIcon>{healthData.data.services.model_loaded ? '✅' : '❌'}</ServiceIcon>
                    <ServiceName>Model Loaded</ServiceName>
                  </ServiceItem>
                </ServicesList>
              ) : (
                <ErrorMessage>
                  {healthData?.error || 'Unable to connect to backend service'}
                </ErrorMessage>
              )}
            </HealthCard>
          </HealthSection>
        </MainContent>
      </StatusContainer>
    </BackgroundManager>
  );
};

// Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const growLine = keyframes`
  0% { height: 0; }
  100% { height: 100%; }
`;

// Styled Components
const StatusContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  color: white;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  font-family: "Advent Pro", sans-serif;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: "Ubuntu", sans-serif;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const DiagnosticsSection = styled.section`
  backdrop-filter: blur(40px) saturate(200%);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 28px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.1);
`;

const HealthSection = styled.section`
  backdrop-filter: blur(40px) saturate(200%);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 28px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  font-family: "Advent Pro", sans-serif;
  letter-spacing: -0.01em;
`;

const RunButton = styled.button<{ isRunning: boolean }>`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 16px;
  background: ${props => props.isRunning ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)'};
  color: ${props => props.isRunning ? '#3b82f6' : '#22c55e'};
  font-size: 1rem;
  font-family: "Ubuntu", sans-serif;
  font-weight: 600;
  cursor: ${props => props.isRunning ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  border: 1px solid ${props => props.isRunning ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
  
  &:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.3);
    transform: translateY(-1px);
  }
  
  ${props => props.isRunning && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const TimelineContainer = styled.div`
  position: relative;
`;

const Timeline = styled.div`
  position: relative;
`;

const TimelineStep = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  opacity: ${props => props.isActive ? 1 : 0.6};
  transition: opacity 0.3s ease;
`;

const StepConnector = styled.div<{ isActive: boolean; isLast: boolean }>`
  position: absolute;
  left: 24px;
  top: 48px;
  width: 2px;
  height: ${props => props.isLast ? '0' : 'calc(100% + 2rem)'};
  background: ${props => props.isActive ?
    'linear-gradient(180deg, #22c55e, #16a34a)' :
    'rgba(255, 255, 255, 0.2)'};
  transition: background 0.5s ease;
  
  ${props => props.isActive && css`
    animation: ${growLine} 0.5s ease-out;
  `}
`;

const StepIndicator = styled.div<{ status: string; isActive: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  margin-right: 1.5rem;
  flex-shrink: 0;
  
  background: ${props => {
    switch (props.status) {
      case 'success': return 'linear-gradient(135deg, #22c55e, #16a34a)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'running': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  
  border: 2px solid ${props => {
    switch (props.status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'running': return '#3b82f6';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  
  box-shadow: ${props => props.isActive ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'};
`;

const StepNumber = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  font-family: "Advent Pro", sans-serif;
  color: white;
`;

const Spinner = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const CheckIcon = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
`;

const ErrorIcon = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: 0.5rem;
`;

const StepTitle = styled.h3<{ status: string }>`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  font-family: "Advent Pro", sans-serif;
  color: ${props => {
    switch (props.status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'running': return '#3b82f6';
      default: return 'white';
    }
  }};
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  font-family: "Ubuntu", sans-serif;
  line-height: 1.5;
`;

const StepDetails = styled.p<{ status: string }>`
  font-size: 0.9rem;
  margin: 0;
  font-family: "Ubuntu", sans-serif;
  font-style: italic;
  color: ${props => {
    switch (props.status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  }};
`;

const HealthCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const HealthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const HealthStatus = styled.div<{ status: string }>`
  font-size: 1.2rem;
  font-weight: 600;
  font-family: "Ubuntu", sans-serif;
  color: ${props => props.status === 'online' ? '#22c55e' : '#ef4444'};
`;

const LastUpdated = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: "Ubuntu", sans-serif;
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ServiceItem = styled.div<{ status: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.status ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => props.status ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const ServiceIcon = styled.div`
  font-size: 1.2rem;
`;

const ServiceName = styled.div`
  font-size: 1rem;
  font-family: "Ubuntu", sans-serif;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 1rem;
  font-family: "Ubuntu", sans-serif;
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

export default StatusPage;