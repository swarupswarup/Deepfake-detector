import React, { useState, useEffect, Suspense } from 'react';
import styled from 'styled-components';

// Lazy load Beams components
const Beams = React.lazy(() => import('./Beams'));
const SimpleBeams = React.lazy(() => import('./SimpleBeams'));

// Error Boundary for Beams
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

interface BackgroundManagerProps {
  children: React.ReactNode;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ children }) => {
  const [useBeams, setUseBeams] = useState(true);
  const [useSimpleBeams, setUseSimpleBeams] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Check if bg.jpg exists
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
    img.src = '/bg.jpg';

    // Check WebGL support for Beams
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setUseBeams(false);
    }
  }, []);

  const handleBeamsError = () => {
    setUseBeams(false);
    setUseSimpleBeams(true);
  };

  return (
    <BackgroundContainer>
      {/* Try complex Beams first, then simple beams, then fallback to image/gradient */}
      {useBeams ? (
        <Suspense fallback={<FallbackBackground imageLoaded={imageLoaded} />}>
          <BeamsBackground>
            <ErrorBoundary onError={handleBeamsError}>
              <Beams
                beamWidth={1.9}
                beamHeight={30}
                beamNumber={20}
                lightColor="#ffffff"
                speed={2}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={30}
              />
            </ErrorBoundary>
          </BeamsBackground>
        </Suspense>
      ) : useSimpleBeams ? (
        <Suspense fallback={<FallbackBackground imageLoaded={imageLoaded} />}>
          <BeamsBackground>
            <SimpleBeams
              beamWidth={1.9}
              beamHeight={30}
              beamNumber={20}
              lightColor="#ffffff"
              speed={2}
            />
          </BeamsBackground>
        </Suspense>
      ) : (
        <FallbackBackground imageLoaded={imageLoaded} />
      )}
      
      {/* Content overlay */}
      <ContentOverlay>
        {children}
      </ContentOverlay>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

const BeamsBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  
  /* Add subtle overlay for better contrast */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
`;

const FallbackBackground = styled.div<{ imageLoaded: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  
  background: ${props => props.imageLoaded 
    ? `url('/bg.jpg') center/cover no-repeat, linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`
    : `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`
  };
  
  /* Add overlay for better contrast */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const ContentOverlay = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
`;

export default BackgroundManager;