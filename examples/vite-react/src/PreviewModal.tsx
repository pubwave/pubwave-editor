import { useState, useRef, useEffect } from 'react';
import { PubwaveEditor } from '../../../src/index';
import type { EditorTheme, EditorAPI } from '@pubwave/editor';
import type { JSONContent } from '@tiptap/core';
import '@pubwave/editor/style.css';

interface PreviewModalProps {
  content: JSONContent;
  theme?: EditorTheme;
  onClose: () => void;
}

export function PreviewModal({ content, theme, onClose }: PreviewModalProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<EditorAPI | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as HTMLElement).closest('.export-menu')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const exportAsImage = async () => {
    if (!editorContainerRef.current || isExporting) return;
    
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const editorElement = editorContainerRef.current.querySelector('.pubwave-editor') as HTMLElement;
      if (!editorElement) {
        console.error('Editor element not found');
        return;
      }

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(editorElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `editor-export-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting as image:', error);
      alert('Failed to export image, please ensure html2canvas is installed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!editorContainerRef.current || isExporting) return;
    
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      // Dynamically import libraries
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const editorElement = editorContainerRef.current.querySelector('.pubwave-editor') as HTMLElement;
      if (!editorElement) {
        console.error('Editor element not found');
        return;
      }

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(editorElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert pixels to mm (assuming 96 DPI: 1px = 0.264583mm)
      const pxToMm = 0.264583;
      const imgWidthMm = canvas.width * pxToMm;
      const imgHeightMm = canvas.height * pxToMm;
      
      // Calculate scaling to fit width
      const widthRatio = pdfWidth / imgWidthMm;
      const scaledWidth = pdfWidth;
      const scaledHeight = imgHeightMm * widthRatio;
      
      // If content fits in one page
      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);
      } else {
        // Split across multiple pages
        let yPosition = 0;
        let sourceY = 0;
        const sourceHeight = pdfHeight / widthRatio / pxToMm;
        
        while (yPosition < scaledHeight) {
          if (yPosition > 0) {
            pdf.addPage();
          }
          
          // Create a temporary canvas for this page slice
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, Math.min(sourceHeight, canvas.height - sourceY),
              0, 0, canvas.width, Math.min(sourceHeight, canvas.height - sourceY)
            );
            const pageImgData = tempCanvas.toDataURL('image/png');
            const pageHeight = Math.min(pdfHeight, scaledHeight - yPosition);
            pdf.addImage(pageImgData, 'PNG', 0, 0, scaledWidth, pageHeight);
          }
          
          sourceY += sourceHeight;
          yPosition += pdfHeight;
        }
      }

      pdf.save(`editor-export-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      alert('Failed to export PDF, please ensure html2canvas and jspdf are installed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="preview-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px',
        overflow: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="preview-modal-content"
        style={{
          width: '100%',
          maxWidth: '1000px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 0,
          marginTop: '40px',
          marginBottom: '24px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close and export buttons */}
        <div
          style={{
            backgroundColor: '#fafafa',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '4px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
              }}
            />
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#111827',
              letterSpacing: '-0.01em',
            }}>
              Preview Mode
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', position: 'relative', alignItems: 'center' }}>
            {/* Export Button */}
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              style={{
                padding: '8px 16px',
                backgroundColor: showExportMenu ? '#2563eb' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                opacity: isExporting ? 0.6 : 1,
                boxShadow: showExportMenu ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!isExporting && !showExportMenu) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting && !showExportMenu) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2V11M8 11L5 8M8 11L11 8M3 11V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isExporting ? 'Exporting...' : 'Export'}
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div
                className="export-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '6px',
                  minWidth: '180px',
                  zIndex: 20,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={exportAsImage}
                  disabled={isExporting}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textAlign: 'left',
                    color: '#374151',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExporting) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4C2 2.89543 2.89543 2 4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 6.5C6.27614 6.5 6.5 6.27614 6.5 6C6.5 5.72386 6.27614 5.5 6 5.5C5.72386 5.5 5.5 5.72386 5.5 6C5.5 6.27614 5.72386 6.5 6 6.5Z" fill="currentColor"/>
                    <path d="M2 10L5 7L8 10L11 7L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export as Image
                </button>
                <button
                  onClick={exportAsPDF}
                  disabled={isExporting}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textAlign: 'left',
                    color: '#374151',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExporting) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V6.41421C14 6.01639 13.842 5.63486 13.5607 5.35355L10.6464 2.43934C10.3651 2.15804 9.98361 2 9.58579 2H4Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9.5 2V5.5C9.5 6.05228 9.94772 6.5 10.5 6.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 9H11M5 11H11M5 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Export as PDF
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '36px',
                height: '36px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div 
          ref={editorContainerRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}
        >
          <PubwaveEditor
            content={content}
            editable={false}
            theme={theme}
            onReady={(api) => {
              editorRef.current = api;
            }}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}

