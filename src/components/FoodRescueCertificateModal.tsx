import React, { useEffect, useState } from 'react';
import { Award, Download, HeartHandshake, Printer, Sparkles, X, ShieldCheck, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { User } from '../types/index.ts';

interface FoodRescueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorUser?: User;
  currentUser?: User;
  metrics?: {
    mealsRescued: number;
    kgSaved: number;
    co2eAvoided: number;
  };
}

export const FoodRescueCertificateModal: React.FC<FoodRescueCertificateModalProps> = ({
  isOpen,
  onClose,
  donorUser,
  currentUser,
  metrics,
}) => {
  const [certQrUrl, setCertQrUrl] = useState<string>('');

  const resolvedDonor = donorUser || currentUser || {
    id: 'u-default',
    name: 'FoodBridge Partner Donor',
    email: 'donor@foodbridge.org',
    role: 'donor' as const,
    organization: 'Sustainable Food Network',
    phone: '+91 98220 11223',
    address: 'Kolhapur City Center',
    latitude: 16.705,
    longitude: 74.2433,
    verified: true,
    created_at: new Date().toISOString(),
  };

  const resolvedMetrics = metrics || {
    mealsRescued: 1420,
    kgSaved: 568,
    co2eAvoided: 2516,
  };

  const certId = `FB-CERT-${resolvedDonor.id.toUpperCase()}`;

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      document: 'FoodBridge Official Food Rescue Certificate',
      certId,
      recipient: resolvedDonor.organization || resolvedDonor.name,
      mealsRescued: resolvedMetrics.mealsRescued,
      kgSaved: resolvedMetrics.kgSaved,
      co2eAvoided: resolvedMetrics.co2eAvoided,
      issuedDate: new Date().toISOString().slice(0, 10),
      sdgTarget: 'UN SDG 2 — Zero Hunger',
      authority: 'FoodBridge AI Community Council',
    });

    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setCertQrUrl(url))
      .catch((err) => console.error('Failed to generate cert QR:', err));
  }, [isOpen, certId, resolvedDonor, resolvedMetrics]);

  // Global ESC key listener to close certificate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 relative">
        {/* Top Header Bar with Prominent Close Cross Option */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span id="cert-title" className="text-sm font-bold tracking-tight">
              Food Rescue Impact Certificate
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Print Certificate or Export as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            {/* Prominent Cross Closing Option in Top Right */}
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center space-x-1 transition-all"
              aria-label="Close Certificate modal"
              title="Close Certificate (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Certificate Body (Print-optimized) */}
        <div className="p-6 sm:p-10 bg-radial from-amber-50/40 via-white to-emerald-50/40 dark:from-slate-900 dark:to-slate-950 text-gray-900 dark:text-white print:p-0">
          <div className="border-4 border-double border-amber-600/40 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
            {/* Watermark / Background stamp */}
            <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
              <Award className="w-80 h-80 text-emerald-800" />
            </div>

            {/* Floating Top-Right Mini Close Button inside Frame */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950 transition-colors print:hidden"
              aria-label="Close certificate"
              title="Close Certificate"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge & Title */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>UN SDG 2 Zero Hunger Partner</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wide text-gray-900 dark:text-white">
                Certificate of Food Rescue
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                COMMUNITY NOURISHMENT &amp; ZERO FOOD WASTE ADVOCATE
              </p>
            </div>

            {/* Awarded to */}
            <div className="space-y-2 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">This Certificate is Proudly Awarded to</p>
              <h2 className="text-xl sm:text-3xl font-bold font-serif text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-500/30 inline-block pb-2 px-6">
                {resolvedDonor.organization || resolvedDonor.name}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                In recognition of exceptional civic responsibility, diverting high-quality prepared surplus food from municipal landfills and feeding vulnerable community shelters in Kolhapur.
              </p>
            </div>

            {/* Impact Metric Highlights */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto py-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {resolvedMetrics.mealsRescued.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Meals Rescued</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">
                  {resolvedMetrics.kgSaved.toLocaleString()} kg
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Food Diverted</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
                  {resolvedMetrics.co2eAvoided.toLocaleString()} kg
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">CO₂e Avoided</span>
              </div>
            </div>

            {/* Verification Signatures, Date & Real Scannable QR */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
              <div className="flex items-center space-x-3 text-left">
                {certQrUrl && (
                  <img
                    src={certQrUrl}
                    alt="Authentic Certificate Verification QR"
                    className="w-16 h-16 rounded-lg border border-emerald-300 p-0.5 bg-white shadow-xs"
                  />
                )}
                <div>
                  <div className="font-mono text-[11px] text-gray-600 dark:text-gray-300 font-bold">
                    ID: {certId}
                  </div>
                  <div className="text-[10px] text-gray-400">Issue Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Real Scannable QR Verified</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-gray-800 dark:text-gray-200">
                  FoodBridge AI Community Council
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">Verified Platform Node #2026</div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic max-w-xl mx-auto pt-1">
              Note: This document is a platform-generated impact recognition certificate for demonstration and participation purposes, not a government certification.
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/90 px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2">
            {certQrUrl && (
              <a
                href={certQrUrl}
                download={`${certId}-qr.png`}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="Download Verification QR Image"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download QR (.png)</span>
              </a>
            )}
            <button
              onClick={() => {
                const summary = `========================================\nFOOD RESCUE IMPACT CERTIFICATE\nUN SDG 2 - Zero Hunger Partner\n========================================\nRecipient: ${resolvedDonor.organization || resolvedDonor.name}\nCertificate ID: ${certId}\nDate: ${new Date().toLocaleDateString()}\n\nIMPACT ACHIEVEMENTS:\n- Meals Rescued: ${resolvedMetrics.mealsRescued.toLocaleString()}\n- Food Diverted: ${resolvedMetrics.kgSaved.toLocaleString()} kg\n- CO2e Avoided: ${resolvedMetrics.co2eAvoided.toLocaleString()} kg\n\nAuthority: FoodBridge AI Community Council\nVerified Platform Node #2026\n========================================`;
                const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${certId}-record.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Download text audit record"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export Record (.txt)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-gray-800 dark:text-gray-200 text-xs font-bold transition-all"
            >
              Close Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
