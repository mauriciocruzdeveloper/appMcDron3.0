import React, { useState, useEffect, useCallback } from 'react';
import './ImageGallery.styles.css';

interface ImageGalleryProps {
    images: string[];
    onDelete?: (url: string) => void;
    isAdmin?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
    images, 
    onDelete, 
    isAdmin = false
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const openFullscreen = (index: number) => {
        setSelectedIndex(index);
        setIsFullscreen(true);
        setZoomLevel(1);
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        setSelectedIndex(null);
        setZoomLevel(1);
    };

    const goToNext = useCallback(() => {
        if (selectedIndex !== null && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1);
            setZoomLevel(1);
        }
    }, [selectedIndex, images.length]);

    const goToPrevious = useCallback(() => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
            setZoomLevel(1);
        }
    }, [selectedIndex]);

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    };

    const handleDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `imagen_${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Navegación con teclado
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowRight':
                    goToNext();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'Escape':
                    closeFullscreen();
                    break;
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, goToNext, goToPrevious]);

    if (!images || images.length === 0) {
        return (
            <div className="image-gallery-empty">
                <i className="bi bi-image" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="text-muted mt-2">No hay imágenes disponibles</p>
            </div>
        );
    }

    return (
        <>
            <div className="image-gallery">
                <div className="image-gallery-grid">
                    {images.map((url, idx) => (
                        <div key={idx} className="image-gallery-item">
                            <div 
                                className="image-gallery-thumbnail"
                                onClick={() => openFullscreen(idx)}
                            >
                                <img
                                    src={url}
                                    alt={`Imagen ${idx + 1}`}
                                    loading="lazy"
                                />
                                <div className="image-gallery-overlay">
                                    <i className="bi bi-zoom-in"></i>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="image-gallery-actions">
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleDownload(url)}
                                        title="Descargar"
                                    >
                                        <i className="bi bi-cloud-download"></i>
                                    </button>
                                    {onDelete && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => onDelete(url)}
                                            title="Eliminar"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="image-gallery-counter">
                                {idx + 1} / {images.length}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visor de pantalla completa */}
            {isFullscreen && selectedIndex !== null && (
                <div className="image-gallery-fullscreen" onClick={closeFullscreen}>
                    <div className="image-gallery-fullscreen-content" onClick={e => e.stopPropagation()}>
                        {/* Barra de herramientas superior */}
                        <div className="image-gallery-toolbar">
                            <div className="image-gallery-toolbar-left">
                                <span className="image-gallery-counter-fullscreen">
                                    {selectedIndex + 1} / {images.length}
                                </span>
                            </div>
                            <div className="image-gallery-toolbar-center">
                                <button 
                                    className="btn btn-sm btn-light"
                                    onClick={handleZoomOut}
                                    disabled={zoomLevel <= 0.5}
                                    title="Alejar (Tecla -)"
                                >
                                    <i className="bi bi-zoom-out"></i>
                                </button>
                                <span className="zoom-indicator">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <button 
                                    className="btn btn-sm btn-light"
                                    onClick={handleZoomIn}
                                    disabled={zoomLevel >= 3}
                                    title="Acercar (Tecla +)"
                                >
                                    <i className="bi bi-zoom-in"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => handleDownload(images[selectedIndex])}
                                    title="Descargar"
                                >
                                    <i className="bi bi-download"></i>
                                </button>
                            </div>
                            <div className="image-gallery-toolbar-right">
                                <button 
                                    className="btn btn-sm btn-light"
                                    onClick={closeFullscreen}
                                    title="Cerrar (ESC)"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>

                        {/* Imagen principal */}
                        <div className="image-gallery-fullscreen-image-container">
                            <img
                                src={images[selectedIndex]}
                                alt={`Imagen ${selectedIndex + 1}`}
                                style={{ 
                                    transform: `scale(${zoomLevel})`,
                                    transition: 'transform 0.2s ease'
                                }}
                            />
                        </div>

                        {/* Controles de navegación */}
                        {selectedIndex > 0 && (
                            <button 
                                className="image-gallery-nav image-gallery-nav-prev"
                                onClick={goToPrevious}
                                title="Anterior (←)"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        )}
                        {selectedIndex < images.length - 1 && (
                            <button 
                                className="image-gallery-nav image-gallery-nav-next"
                                onClick={goToNext}
                                title="Siguiente (→)"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        )}

                        {/* Miniaturas inferiores */}
                        <div className="image-gallery-thumbnails-bar">
                            {images.map((url, idx) => (
                                <div
                                    key={idx}
                                    className={`image-gallery-thumbnail-small ${
                                        idx === selectedIndex ? 'active' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        setZoomLevel(1);
                                    }}
                                >
                                    <img src={url} alt={`Miniatura ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;
