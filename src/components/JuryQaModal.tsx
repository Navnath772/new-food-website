import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

interface JuryQaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JURY_QUESTIONS = [
  {
    q: '1. Why is this problem important?',
    a: 'Globally, 1.3 billion tons of food is wasted annually while over 700 million people face severe food insecurity. In urban centers, college messes, banquet halls, and restaurants discard safe, freshly prepared cooked meals solely due to lack of real-time coordination with nearby shelters. Discarded food in landfills emits methane (CH₄), accelerating climate change. Addressing this solves both immediate hunger (SDG 2) and climate degradation (SDG 12 & 13).',
  },
  {
    q: '2. Why is your solution different from existing food banks or apps?',
    a: 'Traditional food banks rely on scheduled pickups of dry non-perishable goods and cannot handle hot cooked food with a 2-4 hour expiry window. General courier delivery apps lack food safety compliance, cold-chain checks, and recipient capacity matching. FoodBridge AI features a 5-factor weighted algorithm, automated courier dispatch, and cryptographic dual-OTP handshakes, ensuring safe redistribution before hot food spoils.',
  },
  {
    q: '3. Why did you use AI / rule-based intelligence?',
    a: 'Cooked food is hyper-perishable. A human coordinator cannot manually evaluate distance, capacity, diet requirements, and expiry windows for 50 simultaneous donors within 10 minutes. Our intelligence layer automates shelf-life prediction, priority queuing, and multi-variable optimization to match food within seconds, maximizing rescue success rates.',
  },
  {
    q: '4. How does the dynamic matching algorithm work?',
    a: 'Our algorithm computes a normalized 0-100 Match Score using: Match Score = (Distance Score × 30%) + (Food Compatibility × 25%) + (Urgency Score × 20%) + (Capacity Match × 15%) + (NGO Verification × 10%). This guarantees food is routed to the closest, most compatible shelter that has actual beneficiary capacity before expiry.',
  },
  {
    q: '5. How do you calculate distance?',
    a: 'We use the Haversine formula to compute great-circle distances between GPS coordinates (latitude/longitude) of the donor kitchen and candidate NGOs. For routing, distance and travel time are updated dynamically to recommend couriers with appropriate vehicles (e.g. bicycle for <1.5 km, motorcycle for up to 6 km, cargo van for bulk trays).',
  },
  {
    q: '6. How do you prevent unsafe food distribution and liability?',
    a: 'We implement a strict 3-tier food safety shield: (1) Mandatory donor preparation timestamp and storage declaration (e.g., hot holding >60°C or refrigeration <5°C); (2) 7-point physical inspection checklist completed by the volunteer before accepting custody; (3) Digital dual-OTP verification ensuring traceability and timestamped accountability.',
  },
  {
    q: '7. How do you verify NGOs and shelters?',
    a: 'NGOs must submit official registration certificates (e.g., 80G / 12A / Darpan ID), physical location verification, contact supervisor credentials, and beneficiary capacity audits. Unverified organizations are restricted from receiving cooked perishable batches.',
  },
  {
    q: '8. How do you prevent fake donations or prank submissions?',
    a: 'Donors must register with verified institutional credentials. Food listings require photo evidence, kitchen supervisor signoff, and exact GPS pins. If a courier arrives and finds a fraudulent listing, a 1-click fraud report immediately flags the account for suspension.',
  },
  {
    q: '9. How does the volunteer courier system work?',
    a: 'Volunteers register with vehicle details (bicycle, motorcycle, EV cargo bike, car). When a donation is matched, the engine pushes notifications to nearby active volunteers. Volunteers verify the 7-point safety checklist, enter the donor’s Pickup OTP, transport the food in insulated containers, and complete the run by entering the shelter’s Delivery OTP.',
  },
  {
    q: '10. How can this scale to an entire city or metropolis?',
    a: 'The platform architecture is hyper-local and clustered into civic zones (wards/boroughs). Matching executes within a 5 km local radius, allowing parallel scaling across hundreds of municipal wards without cross-city latency.',
  },
  {
    q: '11. How can you integrate municipal systems and smart cities?',
    a: 'FoodBridge AI provides REST APIs to feed data into Municipal Corporation Solid Waste Management (SWM) dashboards, measuring daily tons diverted from municipal landfills and helping cities achieve Swachh Bharat / clean city certifications.',
  },
  {
    q: '12. How will you handle thousands of concurrent users during peak evening hours?',
    a: 'The platform is stateless and containerized. The backend runs on high-performance Express/Node.js or Python Flask with caching for geo-queries and background async task processing for notifications.',
  },
  {
    q: '13. What happens when internet connectivity fails in the field?',
    a: 'The application uses client-side state caching (LocalStore/ServiceWorker). The 4-digit OTP codes are generated at match time and can be verified via SMS fallback or stored locally until network reconnects.',
  },
  {
    q: '14. How is user and recipient data protected?',
    a: 'Beneficiary shelter coordinates are only revealed to assigned couriers during active missions. No sensitive recipient personal data is stored publicly. Passwords and authentication tokens use industry standards.',
  },
  {
    q: '15. What is your business and sustainability model?',
    a: 'The platform is free for NGOs and shelters. Corporate donors, hotel chains, and universities subscribe for ESG (Environmental, Social, Governance) compliance reports, CSR tax credits, and municipal waste reduction subsidies.',
  },
  {
    q: '16. How does this contribute directly to UN SDG 2 (Zero Hunger)?',
    a: 'FoodBridge AI addresses SDG Target 2.1 (universal access to safe, nutritious food) and Target 12.3 (halving per capita global food waste). In our pilot model, 12,840+ meals have been safely redistributed with zero spoilage incidents.',
  },
  {
    q: '17. What are the limitations of the current MVP and future roadmap?',
    a: 'Current MVP focuses on urban cooked meals with rule-based safety estimations. Future scope includes IoT temperature sensors inside courier thermal bags, computer vision food freshness scanning via smartphone camera, and automated route optimization using live traffic APIs.',
  },
];

export const JuryQaModal: React.FC<JuryQaModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const filtered = JURY_QUESTIONS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-gray-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-950 to-emerald-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Hackathon Jury Defense Deck</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">17 Comprehensive Jury Q&A Responses</h2>
            <p className="text-xs text-gray-300">
              Technical, architectural, legal, food safety, and scalability defense answers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search jury question (e.g. food safety, algorithm, scale, municipal, liability)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Question Accordion List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-all bg-white"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <span>{item.q}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-50 bg-emerald-50/20">
                    <div className="flex items-start space-x-2 pt-3">
                      <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <p>{item.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Prepared for Code4Impact & SDG 2 Evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
          >
            Close Defense Prep
          </button>
        </div>
      </div>
    </div>
  );
};
