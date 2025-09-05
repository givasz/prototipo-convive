// src/App.js (CÓDIGO COMPLETO E FINAL)

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { courses } from './courses';

// Ícones SVG
const UploadIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16V10H5L12 3L19 10H15V16H9ZM5 20V18H19V20H5Z" fill="currentColor"/></svg> );
const WhatsappIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2.16998C7.39 2.16998 2.5 5.56 2.5 12.04C2.5 14.19 3.05 15.93 3.94 17.51L2.61 22.95L8.14 21.62C9.64 22.45 10.87 22.65 12.04 22.65C16.69 22.65 21.58 19.26 21.58 12.78C21.59 7.76998 17.15 2.16998 12.04 2.16998ZM17.16 16.48C17.06 16.67 16.92 16.71 16.75 16.79C16.59 16.87 15.22 17.41 14.94 17.53C14.66 17.65 14.47 17.61 14.28 17.48C14.1 17.34 13.59 16.71 13.34 16.48C13.09 16.26 12.92 16.19 12.75 16.12C12.58 16.05 12.42 16.05 12.25 16.05C12.09 16.05 11.91 16.05 11.75 16.05C11.58 16.05 11.33 16.52 10.98 16.89C10.63 17.26 10.33 17.32 10.16 17.34C10 17.37 9.8 17.34 9.61 17.22C9.42 17.09 8.87 16.72 8.35 15.42C7.84 14.12 7.68 12.91 7.6 12.75C7.52 12.58 7.5 12.43 7.68 12.26C7.84 12.1 8.01 11.89 8.17 11.72C8.33 11.55 8.44 11.41 8.59 11.23C8.75 11.06 8.78 10.94 8.87 10.78C8.96 10.62 9.07 10.43 9.16 10.26C9.25 10.09 9.35 9.93 9.53 9.91C9.72 9.89 9.92 9.88 10.11 9.88C10.3 9.88 10.46 9.88 10.59 9.94C10.72 10 10.92 10.21 11.13 10.45C11.35 10.69 11.5 10.95 11.66 11.2C11.82 11.45 11.98 11.73 12.06 11.89C12.13 12.05 12.19 12.16 12.03 12.38C11.87 12.6 11.35 13.29 10.98 13.72C10.62 14.15 10.32 14.44 10.61 14.73C10.91 15.02 11.46 15.65 11.63 15.84C11.8 16.03 12.03 16.21 12.28 16.29C12.54 16.38 12.78 16.35 12.95 16.29C13.12 16.22 13.9 15.93 14.19 15.75C14.48 15.58 14.73 15.44 14.99 15.39C15.26 15.34 16.14 15.71 16.48 15.86C16.82 16.02 17.06 16.26 17.16 16.48Z" /></svg> );
const TwitterIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6C21.73 6.3 20.96 6.5 20.16 6.6C20.98 6.1 21.64 5.3 21.94 4.3C21.17 4.8 20.33 5.1 19.45 5.3C18.72 4.5 17.68 4 16.5 4C14.25 4 12.4 5.85 12.4 8.1C12.4 8.4 12.44 8.7 12.5 9C8.98 8.8 5.89 7.1 3.86 4.6C3.5 5.2 3.3 5.9 3.3 6.6C3.3 8.1 4.12 9.4 5.32 10.2C4.63 10.2 3.98 10 3.4 9.7V9.75C3.4 11.8 4.87 13.5 6.91 13.9C6.58 14 6.22 14.1 5.86 14.1C5.6 14.1 5.33 14.1 5.08 14.05C5.62 15.7 7.18 16.9 9.07 16.9C7.6 18 5.74 18.7 3.69 18.7C3.38 18.7 3.07 18.7 2.77 18.6C4.65 19.8 6.88 20.5 9.29 20.5C16.5 20.5 20.55 14.9 20.55 10.1C20.55 9.9 20.55 9.7 20.54 9.5C21.32 8.9 21.98 8.2 22.46 7.3V6Z"/></svg> );
const CopyIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/></svg> );

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState('file');
  const fileInputRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hasStoredResult, setHasStoredResult] = useState(false);

  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
      setHasStoredResult(true);
    }
  }, []);

  useEffect(() => {
    if (isResultModalOpen || selectedCourse) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isResultModalOpen, selectedCourse]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
      } else {
        setError('Formato inválido. Use apenas .txt ou .pdf.');
        setFile(null);
        setFileName('');
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTwitterShare = () => {
    if (!topRecommendation) return;
    const tweetText = `Fiz uma análise de perfil com a IA da ConviveRH e o curso "${topRecommendation.courseTitle || topRecommendation.title}" é a minha cara! 💡 Faça sua análise também:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() && !file) {
      setError('Por favor, envie um arquivo ou descreva seu perfil.');
      return;
    }
    const formData = new FormData();
    if (file) {
      formData.append('resumeFile', file);
    } else {
      formData.append('resume', textInput);
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const sorted = response.data.recommendations.sort((a, b) => (b.suitabilityScore || b.score) - (a.suitabilityScore || a.score));
      const finalAnalysis = { ...response.data, recommendations: sorted };
      setAnalysis(finalAnalysis);
      localStorage.setItem('analysisResult', JSON.stringify(finalAnalysis));
      setHasStoredResult(true);
      setIsResultModalOpen(true);
    } catch (err) {
      setError('Ocorreu um erro ao analisar. Verifique o console e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
        handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const handleOpenCourseDetails = (courseTitle) => {
    const course = courses.find(c => c.title === courseTitle);
    if (course) {
        setIsResultModalOpen(false);
        setSelectedCourse(course);
    }
  };

  const handleCloseModals = () => {
    setIsResultModalOpen(false);
    setSelectedCourse(null);
  };

const handleNewAnalysis = () => {
    setAnalysis(null);

    setFile(null);
    setTextInput('');
    setFileName('');
    setError('');
  }

  const handleViewLastResult = () => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
        setAnalysis(JSON.parse(storedResult));
    }
  };

  const topRecommendation = analysis?.recommendations[0];
  const otherRecommendations = analysis?.recommendations.slice(1);

 const handleCopy = () => {
    if (!topRecommendation) return;
    const message = `Fiz uma análise de perfil gratuita com a IA da ConviveRH e descobri que o curso "${topRecommendation.courseTitle || topRecommendation.title}" é perfeito para mim! 💡 Quer descobrir o seu? Faça o teste também!`;
    navigator.clipboard.writeText(message).then(() => {
        setCopySuccess('Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };
  const whatsAppLink = `https://wa.me/5538984243175?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20cursos%20recomendados.`;
  
  return (
    <div className="container">
      <header className="header">
        <img src="/images/logo.png" alt="ConviveRH Logo" className="logo-img" />
      </header>
      <div className="title-container">
        <h2 className="title">Analisador de Perfil com IA</h2>
        <p className="subtitle">Descubra os cursos perfeitos para impulsionar sua carreira.</p>
      </div>

      <main className="main-content">
        {loading ? (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Aguarde, nossa IA está preparando sua análise...</p>
            </div>
        ) : analysis ? (
            // TELA DE RESULTADOS
            <div className="results-on-page">
                <div className="results-layout">
                    <div className="results-main-column">
                        <div className="summary-section">
                            <h3>Resumo do seu Potencial</h3>
                            <p>{analysis.profileSummary}</p>
                        </div>
                        
                        {topRecommendation && (
                            <div className="results-card top-recommendation-card">
                                <div className="badge">Melhor Recomendação</div>
                                <h3>{topRecommendation.courseTitle || topRecommendation.title}</h3>
                                <div className="bar-with-score">
                                    <div className="bar-track"><div className="bar-fill-main" style={{ width: `${topRecommendation.suitabilityScore || topRecommendation.score}%` }}></div></div>
                                    <span className="score-label">{topRecommendation.suitabilityScore || topRecommendation.score}%</span>
                                </div>
                                <p className="justification">{topRecommendation.justification}</p>
                                <button className="learn-more-btn" onClick={() => handleOpenCourseDetails(topRecommendation.courseTitle || topRecommendation.title)}>
                                    Saiba Mais sobre o Curso
                                </button>
                            </div>
                        )}
                        
                        {otherRecommendations && otherRecommendations.length > 0 && (
                            <div className="results-card other-recommendations-card">
                                <h4>Afinidade com Outros Cursos</h4>
                                {otherRecommendations.map((rec, index) => (
                                    <div key={rec.courseTitle || rec.title || index} className="course-item">
                                        <div className="course-item-header">
                                            <h5>{rec.courseTitle || rec.title}</h5>
                                            <span className="score-label-small">{rec.suitabilityScore || rec.score}%</span>
                                        </div>
                                        <div className="suitability-bar-small"><div className="bar-fill-small" style={{ width: `${rec.suitabilityScore || rec.score}%` }}></div></div>
                                        <button className="learn-more-btn-small" onClick={() => handleOpenCourseDetails(rec.courseTitle || rec.title)}>
                                            Ver Detalhes
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="results-sidebar-column">
                        <div className="facilitator-section">
                             <div className="facilitator-photo" style={{backgroundImage: `url(/images/rogerio-mendes.jpg)`}}></div>
                            <div className="facilitator-bio">
                                <h2>Conheça o Facilitador</h2>
                                <h3>Rogério Mendes</h3>
                                <p>Psicólogo com MBA em Gestão Estratégica de Pessoas – FGV, Professor de PNL desde 2015 e Fundador da ConviveRH.</p>
                                <p>Palestrante com passagens em organizações como Sicoob, MSD Animal, Copasa, Cemig, Sebrae-MG, TEDx, Grupo Arezzo, Lacoste e muitas outras.</p>
                            </div>
                        </div>
                        <div className="actions-card">
                            <h4>Gostou da Análise?</h4>
                            <div className="share-buttons-container">
                                <button className="share-icon-btn twitter" onClick={handleTwitterShare} title="Compartilhar no Twitter"><TwitterIcon /></button>
                                <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="share-icon-btn whatsapp" title="Falar com a ConviveRH"><WhatsappIcon /></a>
                                <button className="share-icon-btn copy" onClick={handleCopy} title="Copiar análise para compartilhar">
                                    <CopyIcon />
                                    {copySuccess && <span className="copy-success-tooltip">{copySuccess}</span>}
                                </button>
                            </div>
                             <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="whatsapp-btn-full">
                                <WhatsappIcon /> Fale com a gente!
                            </a>
                            <button onClick={handleNewAnalysis} className="new-analysis-btn">Voltar</button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            // TELA INICIAL
            <>
                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        {inputMode === 'file' ? (
                        <div className={`drop-zone ${isDragging ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                            <input type="file" accept=".txt,.pdf" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
                            <UploadIcon />
                            {fileName ? (
                            <div className="file-info">
                                <span>{fileName}</span>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleClearFile(); }} className="clear-file-btn">&#x2715;</button>
                            </div>
                            ) : ( <p>Arraste e solte o currículo aqui, ou clique para selecionar</p> )}
                        </div>
                        ) : (
                        <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Descreva-se aqui, por exemplo 'Me chamo Maria Eduarda...' 'Trabalhei como...'"rows="10" />
                        )}
                        <div className="input-mode-switcher">
                        {inputMode === 'file' ? (
                            <button type="button" onClick={() => setInputMode('text')} className="change-mode-btn">Não tem currículo? Clique aqui!</button>
                        ) : (
                            <button type="button" onClick={() => setInputMode('file')} className="change-mode-btn">Prefiro enviar um arquivo</button>
                        )}
                        </div>
                        <div className="privacy-notice"><span role="img" aria-label="lock">🔒</span> Seus dados são processados e não são armazenados.</div>
                        <button type="submit" className="analyze-btn" disabled={!textInput.trim() && !file}>Analisar Perfil</button>
                    </form>
                </div>
                {error && <div className="error-message">{error}</div>}
                {hasStoredResult && (
                    <div className="view-last-result-container">
                        <button onClick={handleViewLastResult} className="view-results-btn">Ver Meu Último Resultado</button>
                    </div>
                )}
            </>
        )}
      </main>

      {/* MODAIS */}
      {isResultModalOpen && analysis && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modal-content two-column-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModals}>&times;</button>
            <div className="modal-column">
                <div className="modal-header">
                    <h3>Análise Concluída!</h3>
                    <p>{analysis.profileSummary}</p>
                </div>
                {topRecommendation && (
                  <div className="results-card top-recommendation-card modal-card">
                    <div className="badge">Sua Melhor Recomendação</div>
                    <h3>{topRecommendation.courseTitle || topRecommendation.title}</h3>
                    <div className="bar-with-score">
                        <div className="bar-track"><div className="bar-fill-main" style={{ width: `${topRecommendation.suitabilityScore || topRecommendation.score}%` }}></div></div>
                        <span className="score-label">{topRecommendation.suitabilityScore || topRecommendation.score}%</span>
                    </div>
                    <p className="justification">{topRecommendation.justification}</p>
                  </div>
                )}
            </div>
            <div className="modal-column facilitator-column">
                <div className="facilitator-section">
                    <div className="facilitator-photo" style={{backgroundImage: `url(/images/rogerio-mendes.jpg)`}}></div>
                    <div className="facilitator-bio">
                        <h2>Conheça o Facilitador</h2>
                        <h3>Rogério Mendes</h3>
                        <p>Psicólogo com MBA em Gestão Estratégica de Pessoas – FGV, Professor de PNL desde 2015 e Fundador da ConviveRH.</p>
                    </div>
                </div>
                <div className="share-buttons-container">
                    <button className="share-icon-btn twitter" onClick={handleTwitterShare} title="Compartilhar no Twitter"><TwitterIcon /></button>
                    <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="share-icon-btn whatsapp" title="Falar no WhatsApp"><WhatsappIcon /></a>
                    <button className="share-icon-btn copy" onClick={handleCopy} title="Copiar análise para compartilhar">
                        <CopyIcon />
                        {copySuccess && <span className="copy-success-tooltip">{copySuccess}</span>}
                    </button>
                </div>
                <div className="modal-actions">
                    <button className="learn-more-btn" onClick={() => handleOpenCourseDetails(topRecommendation.courseTitle || topRecommendation.title)}>Detalhes do Curso</button>
                    <button className="view-results-btn" onClick={handleCloseModals}>Ver Resultados Completos</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModals}>&times;</button>
            <h2>{selectedCourse.title}</h2>
            <p className="course-description">{selectedCourse.description}</p>
            <h4>O que você vai aprender:</h4>
            <ul className="topics-list">
              {selectedCourse.topics.map((topic, i) => <li key={i}>{topic}</li>)}
            </ul>
            <div className="course-info-grid">
              <div><strong>📍 Local:</strong> {selectedCourse.location}</div>
              <div><strong>💲 Investimento:</strong> {selectedCourse.investment}</div>
            </div>
            {selectedCourse.notes && <p className="course-notes">{selectedCourse.notes}</p>}
            <a href={selectedCourse.link} target="_blank" rel="noopener noreferrer" className="register-btn">Quero me Inscrever!</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;