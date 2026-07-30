import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PrescriptionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: {
    fullName: string;
    age: string;
    gender: string;
    address: string;
    phone: string;
    symptoms: string;
  };
}

export default function PrescriptionPreview({ isOpen, onClose, patientData }: PrescriptionPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [referenceId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [isGenerating, setIsGenerating] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    const element = printRef.current;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = Math.min(
        pageWidth / imgWidth,
        pageHeight / imgHeight
      );
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight);
      
      const safeName = patientData.fullName?.replace(/\s+/g, '_') || 'Patient';
      pdf.save(`CancerAwareBharat_Prescription_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-start p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto custom-scrollbar pt-10 pb-10">
          
          {/* Controls Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-[794px] flex items-center justify-end gap-4 mb-4 shrink-0 print:hidden"
          >
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full bg-white text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-full bg-[#183A63] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#0a2351] disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          {/* PDF Preview Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-[794px] shrink-0 relative bg-white print:w-full print:h-auto shadow-2xl print:shadow-none"
          >
            <style>{`
              @page {
                size: A4 portrait;
                margin: 0;
              }
              @media print {
                html, body {
                  width: 210mm;
                  height: 297mm;
                  overflow: hidden !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                body * {
                  visibility: hidden;
                }
                #prescription-print-area, #prescription-print-area * {
                  visibility: visible !important;
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                #prescription-print-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 210mm !important;
                  height: 297mm !important;
                  overflow: hidden !important;
                  page-break-after: avoid;
                  page-break-before: avoid;
                  page-break-inside: avoid;
                  break-inside: avoid;
                  margin: 0 !important;
                  padding: 0 !important;
                  transform: none !important;
                }
              }
            `}</style>
            
            {/* The actual A4 document (794px by 1123px) */}
            <div 
              id="prescription-print-area"
              ref={printRef}
              className="w-[794px] h-[1123px] bg-white relative overflow-hidden print:w-[794px] print:h-[1123px] mx-auto"
            >
              {/* Master Template Background */}
              <img 
                src="/prescription-template.png" 
                alt="Prescription Template" 
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                crossOrigin="anonymous"
              />

              {/* Dynamic Overlays layer */}
              <div className="absolute inset-0 z-10 text-slate-900 text-lg font-medium font-outfit">
                
                {/* Meta details below QR or top right */}
                <div className="absolute top-[13.5%] right-[5%] text-[11px] font-bold text-slate-700 text-right space-y-0.5 bg-white/80 px-2 py-1 rounded">
                  <div>Ref ID: {referenceId}</div>
                  <div>Date: {currentDate}</div>
                  <div>Time: {currentTime}</div>
                </div>

                {/* Patient Summary Fields */}
                {/* Precise Absolute Positions over lines */}
                <div 
                  className="absolute left-[33.5%] top-[20.3%] w-[60%] whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[17px] font-semibold text-slate-800"
                >
                  {patientData.fullName}
                </div>

                <div 
                  className="absolute left-[33.5%] top-[26.2%] w-[60%] whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[17px] font-semibold text-slate-800"
                >
                  {patientData.age} {patientData.gender ? `/ ${patientData.gender}` : ''}
                </div>

                <div 
                  className="absolute left-[33.5%] top-[32%] w-[60%] whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[17px] font-semibold text-slate-800"
                >
                  {patientData.phone}
                </div>

                <div 
                  className="absolute left-[33.5%] top-[37.8%] w-[60%] px-2 text-[17px] font-semibold text-slate-800 leading-[44px] max-h-[88px] overflow-hidden break-words"
                >
                  {patientData.address}
                </div>

                {/* Treatment Advice / Reported Symptoms */}
                {/* 
                  The lined area starts around top 52%. Each line is usually around 35px-45px apart. 
                  We place a container over the lined area. 
                  Using leading-[38px] to try and match standard ruled lines if needed, or simply render standard text.
                  The user said "Fix text bleed: wrap text, don't overlap, no bleeding. Keep exact spacing like the template."
                */}
                <div 
                  className="absolute left-[5.5%] top-[53%] w-[89%] h-[23%] px-2 text-[16px] font-semibold text-slate-800 leading-[38px] break-words overflow-hidden"
                >
                  {patientData.symptoms}
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
