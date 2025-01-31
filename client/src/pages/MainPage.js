import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'framer-motion';
import InputBox from '../components/InputBox';
import LoadingAnimation from '../components/LoadingAnimation';
import { useNavigate } from 'react-router';
import { addKBtoLocalStorage } from '../utils/localStorage';

const MotionBox = motion(Box);

const API_URL_UP = 'http://localhost:5000/api/url-generate';
const API_FILE_UP = 'http://localhost:5000/api/pdf-generate';

function MainPage({brainRot, isLoading, setIsLoading, refreshSavedKbs}) {
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleUrlSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL_UP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        addKBtoLocalStorage(url, data.kb_id, data.title, data.data);
        refreshSavedKbs();
        navigate("/result", { state: { idx: 0, scriptText: data.data } });
      } else {
        throw new Error(data.error || 'Failed to extract text');
      }
    } catch (error) {
      console.error('Error fetching script:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSubmit = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_FILE_UP, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        addKBtoLocalStorage(null, data.kb_id, data.title, data.data);
        refreshSavedKbs();
        navigate("/result", { state: { idx: 0, scriptText: data.data } });
      } else {
        throw new Error(data.error || 'Failed to extract text');
      }
    } catch (error) {
      console.error('Error fetching script:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>      
      <AnimatePresence mode="wait">
        {!isLoading && (
          <MotionBox
            key="input"
            className="url-input-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '80vh',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw'
            }}
          >
            <InputBox onSubmitURL={handleUrlSubmit} onSubmitFile={handleFileSubmit} />
            {error && (
              <Box sx={{ 
                position: 'relative',
                zIndex: 1,
                color: 'error.main',
                textAlign: 'center',
                mt: 2,
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1
              }}>
                {error}
              </Box>
            )}
          </MotionBox>
        )}
        {isLoading && (
          <MotionBox
            key="loading"
            className="loading-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: 'relative',
              zIndex: 1
            }}
          >
            <LoadingAnimation brainRot={brainRot}/>
          </MotionBox>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainPage;