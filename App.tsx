import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { StyleCard } from './components/StyleCard';
import { PRESET_STYLES, ASPECT_RATIOS, PRODUCT_ANGLES } from './constants';
import { StyleTemplate, AspectRatio, ProductAngle, ProcessingStep, GeneratedImage, DetailResult } from './types';
import { generateStyleSuggestions, generateAdImage, fileToGenerativePart, analyzeProductImage, generateProductDetails } from './services/geminiService';
import { UploadCloud, Image as ImageIcon, RefreshCw, Sparkles, Wand2, Download, Share2, Loader2, LayoutTemplate as LayoutIcon, X, Trash2, FileText, Box, Copy, Layers, ZoomIn, Check, ListChecks, Type, Key } from 'lucide-react';

const App: React.FC = () => {
  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);

  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  // Product Description State
  const [productDescription, setProductDescription] = useState<string>("");
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);

  // Manual Detail Points State
  const [manualPoints, setManualPoints] = useState<string[]>(['', '', '']);

  const [styles, setStyles] = useState<StyleTemplate[]>(PRESET_STYLES);
  const [selectedStyle, setSelectedStyle] = useState<StyleTemplate | null>(PRESET_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(AspectRatio.Portrait);
  const [productAngle, setProductAngle] = useState<string>(ProductAngle.Front);
  
  const [isGeneratingStyles, setIsGeneratingStyles] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  
  // Results
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [detailResults, setDetailResults] = useState<DetailResult[]>([]);
  const [activeTab, setActiveTab] = useState<'poster' | 'details'>('poster');

  // History / Portfolio State
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback or dev environment
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset previous analysis & results
      setProductDescription("");
      setManualPoints(['', '', '']); // Reset manual points
      setResultImage(null);
      setDetailResults([]);
      setProcessingStep('uploading');
      
      try {
        const b64 = await fileToGenerativePart(file);
        setImageBase64(b64);
        setProcessingStep('idle');

        // Trigger Product Analysis
        setIsAnalyzingProduct(true);
        const description = await analyzeProductImage(b64);
        setProductDescription(description);
        setIsAnalyzingProduct(false);

      } catch (e) {
        console.error(e);
        setProcessingStep('idle');
        setIsAnalyzingProduct(false);
      }
    }
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...manualPoints];
    newPoints[index] = value;
    setManualPoints(newPoints);
  };

  const handleAutoStyle = async () => {
    if (!imageBase64) return;
    setIsGeneratingStyles(true);
    try {
      const newStyles = await generateStyleSuggestions(imageBase64);
      // Combine with presets, putting new ones first
      setStyles([...newStyles, ...PRESET_STYLES]);
      if (newStyles.length > 0) {
        setSelectedStyle(newStyles[0]);
      }
    } catch (e) {
      console.error("Failed to generate styles", e);
      alert("無法自動產生風格，請檢查您的 API Key。");
    } finally {
      setIsGeneratingStyles(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!imageBase64 || !selectedStyle) return;
    
    setProcessingStep('generating');
    setActiveTab('poster');
    setResultImage(null);
    setDetailResults([]);

    try {
      if (window.innerWidth < 768) {
        setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }

      // Execute both generation tasks in parallel
      const [adUrl, details] = await Promise.all([
        generateAdImage(
          imageBase64,
          selectedStyle.prompt,
          aspectRatio,
          productDescription,
          productAngle
        ),
        generateProductDetails(
          imageBase64, 
          selectedStyle.prompt, 
          productDescription,
          manualPoints
        )
      ]);

      setResultImage(adUrl);
      setDetailResults(details);
      
      // Save to history (Main Visual)
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: adUrl,
        styleName: selectedStyle.name.split('(')[0].trim(),
        timestamp: Date.now()
      };
      
      setHistory(prev => [newImage, ...prev]);

      // Scroll to result
      setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);

    } catch (e) {
      console.error("Generation failed", e);
      alert("生成失敗，請稍後再試。");
    } finally {
      setProcessingStep('idle');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(img => img.id !== id));
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-white shadow-inner">
            <Key size={32} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-serif-display text-white">需要 API 金鑰</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              本應用程式使用頂級的 <strong>Nano Banana Pro (Gemini 3.0 Pro)</strong> 模型來確保最佳畫質。
              <br/><br/>
              請連結您的 Google Cloud 專案 API 金鑰以繼續使用。
            </p>
          </div>
          
          <button 
            onClick={handleSelectKey}
            className="w-full bg-white text-black py-3.5 rounded-xl font-bold hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            連結 API 金鑰
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-block text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
          >
            查看計費說明 (Pay-as-you-go)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-20 text-zinc-100 selection:bg-white selection:text-black relative">
      <Header onOpenPortfolio={() => setShowPortfolio(true)} historyCount={history.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Input & Configuration */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. Image Upload */}
            <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ImageIcon size={18} /> 上傳產品圖
                </h2>
                {selectedImage && (
                  <button 
                    onClick={() => { 
                      setSelectedImage(null); 
                      setPreviewUrl(null); 
                      setImageBase64(null); 
                      setProductDescription("");
                      setManualPoints(['', '', '']);
                      setResultImage(null);
                      setDetailResults([]);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    移除
                  </button>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
              />

              {!previewUrl ? (
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-zinc-900/50"
                >
                  <div className="w-16 h-16 bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-700 group-hover:text-zinc-200 transition-colors">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">點擊上傳產品圖片</p>
                  <p className="text-xs text-zinc-500 mt-1">支援 JPG, PNG, WebP</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-zinc-700 group bg-black">
                    <img src={previewUrl} alt="Product" className="w-full h-auto object-contain max-h-[300px]" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                      <button 
                        onClick={triggerFileInput}
                        className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                      >
                        <RefreshCw size={14} /> 更換圖片
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Description Field */}
                  <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <FileText size={12} /> 描述主體
                      </label>
                      {isAnalyzingProduct && (
                        <span className="text-[10px] text-indigo-400 flex items-center gap-1 animate-pulse">
                           <Sparkles size={10} /> 分析中...
                        </span>
                      )}
                    </div>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      disabled={isAnalyzingProduct}
                      className="w-full bg-zinc-900 text-zinc-200 text-sm rounded-md border border-zinc-800 p-2 focus:outline-none focus:ring-1 focus:ring-white/50 min-h-[80px] resize-y placeholder:text-zinc-600"
                      placeholder={isAnalyzingProduct ? "正在分析您的產品特徵..." : "等待上傳圖片..."}
                    />
                  </div>
                </div>
              )}
            </section>

             {/* Manual Detail Points (New Section) */}
             <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                     <ListChecks size={18}/> 自訂細節重點
                  </h2>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">選填</span>
               </div>
               <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                 若填寫，AI 將優先根據您的指示生成對應的特寫圖與文案 (最多3組)。
               </p>
               <div className="space-y-3">
                 {manualPoints.map((point, idx) => (
                   <div key={idx} className="flex items-center gap-2">
                     <span className="text-xs text-zinc-600 w-4 font-mono">{idx + 1}.</span>
                     <input
                       type="text"
                       value={point}
                       onChange={(e) => handlePointChange(idx, e.target.value)}
                       placeholder={`例如：${idx === 0 ? '瓶身Logo壓紋' : idx === 1 ? '按壓頭特寫' : '材質質感細節'}`}
                       className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 placeholder:text-zinc-700 transition-all"
                     />
                   </div>
                 ))}
               </div>
            </section>

            {/* 2. Configuration - Combined Angle */}
            <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-6">
               
               {/* Product Presentation Settings */}
               <div>
                 <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                   <Box size={18}/> 畫面呈現設定
                 </h2>

                 {/* 1. Angle Selection */}
                 <div className="mb-5">
                   <label className="text-xs text-zinc-400 mb-2 block font-medium">拍攝角度</label>
                   <div className="grid grid-cols-2 gap-3">
                      {PRODUCT_ANGLES.map(angle => (
                        <button
                          key={angle.value}
                          onClick={() => setProductAngle(angle.value)}
                          className={`
                            text-sm py-2.5 px-3 rounded-lg border transition-all
                            ${productAngle === angle.value
                              ? 'bg-zinc-100 text-black border-white font-medium'
                              : 'bg-zinc-800/50 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                            }
                          `}
                        >
                          {angle.label}
                        </button>
                      ))}
                   </div>
                 </div>
               </div>

               <div className="h-px bg-zinc-800 my-4" />

               {/* Aspect Ratio */}
               <div>
                 <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                   {/* Correct usage: LayoutIcon alias for LayoutTemplate component */}
                   <LayoutIcon size={18}/> 廣告尺寸
                 </h2>
                 <div className="grid grid-cols-2 gap-3">
                    {ASPECT_RATIOS.map(ratio => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`
                          text-sm py-2.5 px-3 rounded-lg border transition-all
                          ${aspectRatio === ratio.value
                            ? 'bg-zinc-100 text-black border-white font-medium'
                            : 'bg-zinc-800/50 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                          }
                        `}
                      >
                        {ratio.label}
                      </button>
                    ))}
                 </div>
               </div>
            </section>
          </div>

          {/* MIDDLE PANEL: Style Selection */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
             <div className="flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif-display font-semibold text-white">選擇風格</h2>
                <button 
                  onClick={handleAutoStyle}
                  disabled={!imageBase64 || isGeneratingStyles}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                    ${!imageBase64 
                      ? 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed'
                      : 'bg-white text-black border-white hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    }
                  `}
                >
                  {isGeneratingStyles ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                  {isGeneratingStyles ? '分析中...' : 'AI 找風格'}
                </button>
             </div>
             
             {/* Grid Layout for Styles */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar content-start flex-1 min-h-[400px]">
                {styles.map(style => (
                  <StyleCard 
                    key={style.id}
                    style={style}
                    isSelected={selectedStyle?.id === style.id}
                    onSelect={setSelectedStyle}
                  />
                ))}
             </div>
             
             {/* Selected Style Info Summary */}
             <div className="shrink-0 mt-4 min-h-[100px]">
               {selectedStyle ? (
                  <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="text-lg font-semibold text-white">{selectedStyle.name}</h4>
                       <div className="h-4 w-4 rounded-full border border-white/20" style={{ background: selectedStyle.previewColor }}></div>
                     </div>
                     <p className="text-sm text-zinc-300 leading-relaxed">{selectedStyle.description}</p>
                     <div className="mt-3 flex flex-wrap gap-2">
                        {selectedStyle.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700">
                            #{tag}
                          </span>
                        ))}
                     </div>
                  </div>
               ) : (
                 <div className="h-full bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm">
                    請選擇一個風格
                 </div>
               )}
             </div>
          </div>

          {/* RIGHT PANEL: Result & Action */}
          <div className="lg:col-span-4" ref={resultSectionRef}>
            <div className="sticky top-24 space-y-6">
              
              {/* Action Button */}
              <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
                
                <h3 className="font-serif-display text-2xl mb-2 text-white">準備生成</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  確認設定無誤後，AI 將為您製作全套素材：
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateAll}
                    disabled={!imageBase64 || processingStep !== 'idle'}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl
                      ${(!imageBase64 || processingStep !== 'idle')
                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-[1.02] hover:shadow-indigo-500/25'
                      }
                    `}
                  >
                    {processingStep === 'generating' ? (
                      <>
                        <Loader2 className="animate-spin" /> 全速生成中... (海報 + 3張細節)
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} /> 一鍵生成完整素材包
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-zinc-500 mt-2">
                     包含：主視覺海報 x1 + 產品細節圖 x3 + 行銷文案
                  </p>
                </div>
              </div>

              {/* A AREA: RESULT CANVAS */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                   <h4 className="text-sm font-bold text-zinc-400">生成的素材</h4>
                  <div className="flex space-x-4 items-center">
                     <button 
                       onClick={() => setActiveTab('poster')}
                       className={`text-sm font-medium transition-colors ${activeTab === 'poster' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                     >
                       海報預覽
                     </button>
                     {detailResults.length > 0 && (
                        <button 
                          onClick={() => setActiveTab('details')}
                          className={`text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          細節圖 ({detailResults.length})
                        </button>
                     )}
                  </div>
                  {activeTab === 'poster' && resultImage && (
                    <a 
                      href={resultImage} 
                      download={`adzen-${Date.now()}.png`}
                      className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Download size={14} /> 下載
                    </a>
                  )}
                </div>
                
                <div className="flex-1 bg-black p-4 relative">
                  
                  {/* POSTER TAB */}
                  {activeTab === 'poster' && (
                    <div className="h-full flex items-center justify-center min-h-[300px]">
                      {resultImage ? (
                        <div className="relative group">
                           <img 
                             src={resultImage} 
                             alt="Generated Ad" 
                             className="max-w-full max-h-[500px] object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-500"
                           />
                        </div>
                      ) : (
                        <div className="text-center text-zinc-600">
                           {processingStep === 'generating' ? (
                             <div className="flex flex-col items-center animate-pulse">
                                <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-3"></div>
                                <p className="text-sm">正在施展魔法，繪製主視覺與細節圖...</p>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center">
                                <Sparkles size={32} className="text-zinc-800 mb-2" />
                                <p className="text-sm">海報成品將顯示於此</p>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DETAILS TAB */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                       {detailResults.length > 0 ? (
                         <>
                         {detailResults.map((detail, idx) => (
                           <div key={detail.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col sm:flex-row animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                              <div className="w-full sm:w-28 h-28 bg-black shrink-0 relative group">
                                <img src={detail.url} alt={detail.focusPoint} className="w-full h-full object-cover" />
                                <a href={detail.url} download={`detail-${idx}.png`} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded hover:bg-black transition-colors opacity-0 group-hover:opacity-100">
                                  <Download size={12} />
                                </a>
                              </div>
                              <div className="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">
                                      Focus: {detail.focusPoint}
                                    </span>
                                  </div>
                                  <p className="text-sm text-zinc-200 leading-relaxed line-clamp-2">
                                    {detail.caption}
                                  </p>
                                </div>
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleCopyText(detail.caption, detail.id)}
                                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                  >
                                    {copiedId === detail.id ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedId === detail.id ? '已複製' : '複製文案'}
                                  </button>
                                </div>
                              </div>
                           </div>
                         ))}
                         </>
                       ) : (
                         <div className="h-full min-h-[300px] flex items-center justify-center text-center text-zinc-600">
                            {processingStep === 'generating' ? (
                               <div className="flex flex-col items-center animate-pulse">
                                  <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-3"></div>
                                  <p className="text-sm">正在分析特徵並撰寫文案 (0/3)...</p>
                               </div>
                            ) : (
                               <p className="text-sm">尚未生成細節圖</p>
                            )}
                         </div>
                       )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* PORTFOLIO MODAL OVERLAY */}
      {showPortfolio && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md animate-in fade-in duration-200 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-serif-display text-white">我的作品集</h2>
            <button 
              onClick={() => setShowPortfolio(false)}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
                   <ImageIcon size={32} opacity={0.5} />
                </div>
                <p className="text-lg">尚未生成任何作品</p>
                <button 
                   onClick={() => setShowPortfolio(false)}
                   className="text-sm text-white underline hover:text-zinc-300"
                >
                  去生成第一張
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {history.map(item => (
                  <div key={item.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-lg hover:border-zinc-600 transition-all">
                    <div className="aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                      <img src={item.url} alt={item.styleName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-white text-sm truncate">{item.styleName}</h3>
                      <p className="text-zinc-500 text-xs mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <a 
                          href={item.url} 
                          download={`adzen-${item.id}.png`}
                          className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 hover:scale-110 transition-all"
                          title="下載"
                       >
                         <Download size={18} />
                       </a>
                       <button 
                          onClick={() => handleDeleteFromHistory(item.id)}
                          className="p-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white hover:scale-110 transition-all"
                          title="刪除"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default App;