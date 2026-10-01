# SMART CIVIC CONNECT
## AI-Based Civic Complaint and Urban Service Management System

Smart Civic Connect is an enterprise-grade, full-stack civic technology platform engineered for municipal corporations and urban local bodies. It enables citizens to report civic breakdowns with real multimodal AI analysis (image vision + speech/text NLP), automatic ward determination, and deterministic department routing, while empowering administrators with real-time geospatial operations, SLA tracking, and resolution lifecycle management.

---

### Key Architectural Highlights

1. **Logo Requirement Compliance**
   - **Symbol-Only Emblem**: Uses exclusively the official Smart City emblem (skyscrapers, smart luminaire with Wi-Fi signal arcs, winding road, and dual-leaf cradle in `#0F766E` deep teal and `#10B981` emerald green).
   - **No Embedded Text**: Brand name "Smart Civic Connect" is rendered as separate semantic HTML typography.

2. **Real Multimodal AI Classification**
   - **Visual Inference**: Evaluates images across 9 standard civic categories:
     `garbage_overflow`, `pothole`, `water_leakage`, `broken_streetlight`, `drainage_blockage`, `illegal_dumping`, `road_damage`, `fallen_tree`, `others`.
   - **Multimodal Weighting**: 70% visual model confidence + 30% natural language intent weighting.
   - **Disagreement & Confidence Handling**:
     - `>= 80%`: High Confidence.
     - `50% - 79%`: Medium Confidence.
     - `< 50%`: Low Confidence triggers mandatory citizen category confirmation.
     - Strong visual vs. textual contradiction triggers: *"AI RESULT REQUIRES USER CONFIRMATION"*.
   - **No Fake Predictions**: If model or server key is offline, gracefully shows *"AI MODEL NOT INSTALLED"*.

3. **Geospatial & Ward Detection Rule**
   - **Strict Separation of Concerns**: Wards are derived exclusively from geographic coordinates (browser GPS or Dahisar demo location), **never from image AI**.
   - **Dahisar, Mumbai (R/North) Testbed**:
     - Demo Ward 01: Dahisar East (Station Area & Anand Nagar)
     - Demo Ward 02: Dahisar East (Rawalpada & Ketkipada)
     - Demo Ward 03: Dahisar West (Kandar Pada & Link Road)
     - Demo Ward 04: Dahisar West (Mandapeshwar & Borivali Border)
     - Demo Ward 05: Dahisar East (Ashokvan & Western Express Highway)
     - Demo Ward 06: Dahisar West (Gaothan & Coastal Creek belt)
     *(Clearly labeled as DEMO WARDS for academic demonstration)*.

4. **Deterministic Department Routing Engine**
   - Solid Waste Management (`dept_swm`): Garbage Overflow, Illegal Dumping.
   - Road & Infrastructure (`dept_roads`): Potholes, Paver damage, Road surface.
   - Water Supply / Hydraulic (`dept_water`): Pipeline bursts, Clean water leaks.
   - Electrical Department (`dept_electrical`): Dead streetlights, sparking poles.
   - Drainage Department (`dept_drainage`): Choked gutters, open manholes.
   - Tree & Garden Department (`dept_garden`): Fallen trees, hazardous branches.
   - Ward Office (`dept_ward_office`): General civic reviews, non-standard issues.

5. **Demo-Only Authority Dispatch**
   - "Send to Authority" action is strictly simulated for college showcases. It never transmits external emails, SMS, or government API calls, and confirms: *"Demo Action Completed. No real external authority was contacted."*

---

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Glassmorphic UI Design System.
- **Backend**: Node.js & Express (`server.ts`) with Vite middlewares.
- **AI Engine**: `@google/genai` multimodal vision pipeline (`gemini-3.8-flash`) + Client NLP intent parser.
- **Mapping**: Dynamic vector canvas map with Dahisar urban corridors, creek lines, Western Express Highway, and interactive pin placement.

---

### Quick Testing / Professor Evaluation

1. Click **"Report a Problem"** or choose any of the 1-click presets:
   - *Garbage Overflow Test*
   - *Pothole Test*
   - *Water Leakage Test*
   - *Streetlight Test*
   - *Drainage Test*
2. Experience the AI scanning animation and top class probabilities.
3. Use Speech-to-Text (English, Hindi, Marathi) or typed input.
4. Pinpoint location on the Dahisar interactive map.
5. Review automatic department routing and submit to obtain a unique `CMP-2026-XXXXXX` ID.
6. Switch to **Admin Portal** using the 1-click toggle in the navbar to filter by City, Ward, Department, and Status, inspect live map markers, update status, and test the demo dispatch.
