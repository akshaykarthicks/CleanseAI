import React, { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { ImageUploader } from '../components/ImageUploader';
import { ImageViewer } from '../components/ImageViewer';
import { ActionButton } from '../components/ActionButton';
import { Loader } from '../components/Loader';
import { AppState, FileInfo } from '../types';

const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileInfo({
        name: file.name,
        type: file.type,
        base64: reader.result as string,
      });
      setProcessedImage(null);
      setPrompt('');
      setAppState(AppState.IDLE);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
      setAppState(AppState.ERROR);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveObject = useCallback(async () => {
    if (!fileInfo) {
      setError('Please upload an image first.');
      setAppState(AppState.ERROR);
      return;
    }
    if (!prompt.trim()) {
      setError('Please describe what you want to remove.');
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.PROCESSING);
    setError(null);
    setProcessedImage(null);

    try {
      const base64Data = fileInfo.base64.split(',')[1];
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64ImageData: base64Data,
          mimeType: fileInfo.type,
          userPrompt: prompt,
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.text || 'An error occurred while processing the image.');
      }

      const result = await response.json();

      if (result.image) {
        setProcessedImage(`data:${fileInfo.type};base64,${result.image}`);
        setAppState(AppState.SUCCESS);
      } else {
        setError(result.text || 'The AI could not process the image. Please try another one.');
        setAppState(AppState.ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      setAppState(AppState.ERROR);
    }
  }, [fileInfo, prompt]);
  
  const handleDownload = () => {
    if (!processedImage || !fileInfo) return;
    const link = document.createElement('a');
    const originalName = fileInfo.name.substring(0, fileInfo.name.lastIndexOf('.'));
    const extension = fileInfo.name.substring(fileInfo.name.lastIndexOf('.') + 1);
    link.download = `${originalName}_cleansed.${extension}`;
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReset = () => {
    setAppState(AppState.IDLE);
    setFileInfo(null);
    setProcessedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <Header />
      <main className="w-full max-w-7xl flex flex-col items-center flex-grow">
        {!fileInfo && (
          <div className="w-full max-w-xl mt-12">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        )}

        {fileInfo && (
          <div className="w-full flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
              <ImageViewer label="Original Image" src={fileInfo.base64} />
              <ImageViewer label="Result" src={processedImage}>
                 {appState === AppState.PROCESSING && <Loader />}
              </ImageViewer>
            </div>
            
            <div className="w-full max-w-3xl mt-8">
                <label htmlFor="prompt-input" className="block mb-2 text-sm font-medium text-gray-300">
                    What should be cleansed? (e.g., "the person in the red shirt")
                </label>
                <input
                    type="text"
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={appState === AppState.PROCESSING}
                    placeholder="Describe the object or imperfection to remove..."
                    className="bg-[#0a0a0a] border border-[#3e0000] text-gray-100 text-sm rounded-lg focus:ring-[#f80000] focus:border-[#f80000] block w-full p-2.5 transition"
                    aria-label="Object removal prompt"
                />
            </div>

            {error && (
              <div className="mt-6 p-4 bg-[#3e0000]/50 border border-[#7c0000] text-red-200 rounded-lg w-full max-w-3xl text-center">
                <p className="font-semibold">An error occurred:</p>
                <p>{error}</p>
              </div>
            )}
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <ActionButton
                onClick={handleRemoveObject}
                disabled={appState === AppState.PROCESSING || !prompt.trim()}
              >
                {appState === AppState.PROCESSING ? 'Cleansing...' : 'Cleanse Image'}
              </ActionButton>
              <ActionButton
                onClick={handleDownload}
                disabled={appState !== AppState.SUCCESS}
                variant="secondary"
              >
                Download Image
              </ActionButton>
               <ActionButton
                onClick={handleReset}
                variant="tertiary"
              >
                Start Over
              </ActionButton>
            </div>
          </div>
        )}
      </main>
       <footer className="w-full text-center p-4 mt-12 text-gray-500 text-sm">
        <p>
            Powered by Google Gemini. Made by{' '}
            <a 
                href="https://github.com/akshaykarthicks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#f80000] hover:text-[#ba0000] underline"
            >
                akshaykarthicks
            </a>.
        </p>
      </footer>
    </div>
  );
};

export default Home;
