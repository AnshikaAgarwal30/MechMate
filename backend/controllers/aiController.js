const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

/**
 * Fallback heuristic diagnostic engine when GEMINI_API_KEY is not available
 * or fails due to network/quota issues. Ensures the system never breaks.
 */
function runRuleBasedDiagnosis(description = '', vehicle = {}, file = null) {
  const text = (description + ' ' + (vehicle.make || '') + ' ' + (vehicle.model || '')).toLowerCase();
  
  let predictedIssueType = 'other';
  let issueTitle = 'General Vehicle Mechanical Issue';
  let confidenceScore = 'medium';
  let possibleCauses = [];
  let safetyAdvice = [];
  let recommendedSpecialization = ['General Mechanic', 'Roadside Technician'];
  let recommendedUrgency = 'medium';
  let detectedComponents = [];

  if (text.match(/batter|click|crank|starter|alternat|dead|no start|won't start|dim|flicker|jump/)) {
    predictedIssueType = 'battery';
    issueTitle = 'Electrical / Battery Starting System Malfunction';
    confidenceScore = 'high';
    possibleCauses = [
      'Discharged or dead 12V lead-acid battery',
      'Corroded or loose battery terminals',
      'Faulty starter motor solenoid',
      'Failing alternator diode unable to maintain system voltage'
    ];
    safetyAdvice = [
      'Turn off non-essential electricals (headlights, blower, multimedia) immediately',
      'Do not crank the ignition continuously for more than 5 seconds to prevent starter burnout',
      'If jump-starting, ensure cables are connected in the correct polarity (Red to +, Black to ground)'
    ];
    recommendedSpecialization = ['Auto Electrician', 'Battery Specialist', 'Starter & Alternator Repair'];
    recommendedUrgency = 'medium';
    detectedComponents = ['12V Battery', 'Starter Motor', 'Alternator'];
  } else if (text.match(/tire|tyre|flat|puncture|blowout|rim|pressure|tpms|wheel/)) {
    predictedIssueType = 'tire';
    issueTitle = 'Tire Pressure Loss or Puncture Damage';
    confidenceScore = 'high';
    possibleCauses = [
      'Puncture from road debris (nail, screw, or glass)',
      'Sidewall bubble, tear, or structural rim leak',
      'Defective valve stem core or bead seal failure'
    ];
    safetyAdvice = [
      'Move vehicle safely off the driving lane onto flat, stable ground',
      'Engage parking brake and activate hazard warning blinkers',
      'Never drive on a completely flat tire as it will destroy the wheel rim and brake assembly'
    ];
    recommendedSpecialization = ['Tire & Wheel Specialist', 'Puncture Repair', 'Suspension'];
    recommendedUrgency = 'high';
    detectedComponents = ['Tire', 'Wheel Rim', 'Valve Stem'];
  } else if (text.match(/overheat|smoke|steam|coolant|radiator|temp|temperature|boiling/)) {
    predictedIssueType = 'engine';
    issueTitle = 'Engine Overheating / Cooling System Failure';
    confidenceScore = 'high';
    possibleCauses = [
      'Low engine coolant level or severe radiator hose rupture',
      'Faulty thermostat stuck in closed position',
      'Electric radiator cooling fan motor failure',
      'Water pump impeller failure'
    ];
    safetyAdvice = [
      'DANGER: DO NOT open the radiator cap or coolant reservoir while the engine is hot',
      'Pull over safely and turn off the engine immediately to prevent engine seizure or cylinder head warping',
      'Wait at least 20-30 minutes for engine to cool before inspecting fluid levels'
    ];
    recommendedSpecialization = ['Engine Specialist', 'Cooling System Repair', 'Master Mechanic'];
    recommendedUrgency = 'emergency';
    detectedComponents = ['Radiator', 'Coolant Reservoir', 'Cooling Fan', 'Engine Block'];
  } else if (text.match(/engine|check engine|misfire|knock|sputter|oil|shake|rough idle|cel/)) {
    predictedIssueType = 'engine';
    issueTitle = 'Engine Misfire / Powertrain Malfunction';
    confidenceScore = 'medium';
    possibleCauses = [
      'Worn spark plugs or failed ignition coil pack',
      'Low engine oil pressure or contaminated oil',
      'Clogged fuel injector or mass airflow sensor malfunction',
      'Faulty oxygen sensor or catalytic converter restriction'
    ];
    safetyAdvice = [
      'If the Check Engine Light is flashing, stop driving immediately to avoid catalytic converter destruction',
      'Avoid high-RPM acceleration and heavy throttle loads',
      'Check the engine oil dipstick if safe to do so'
    ];
    recommendedSpecialization = ['Engine Specialist', 'OBD-II Diagnostic Technician'];
    recommendedUrgency = 'high';
    detectedComponents = ['Engine', 'Ignition Coils', 'Spark Plugs', 'Exhaust Sensor'];
  } else if (text.match(/fuel|petrol|diesel|gas|empty|fuel pump|stall/)) {
    predictedIssueType = 'fuel';
    issueTitle = 'Fuel Delivery or Starvation Issue';
    confidenceScore = 'medium';
    possibleCauses = [
      'Empty or near-empty fuel tank',
      'Fuel pump relay or in-tank fuel pump failure',
      'Severely clogged fuel filter'
    ];
    safetyAdvice = [
      'Stay inside vehicle if stranded on highway shoulder until roadside assistance arrives',
      'Do not repeatedly attempt starting on an empty tank as fuel lubricates the pump'
    ];
    recommendedSpecialization = ['Fuel System Repair', 'Roadside Fuel Delivery', 'General Mechanic'];
    recommendedUrgency = 'medium';
    detectedComponents = ['Fuel Pump', 'Fuel Tank', 'Fuel Filter'];
  } else if (text.match(/accident|crash|collision|hit|dent|bumper|chassis|tow/)) {
    predictedIssueType = 'accident';
    issueTitle = 'Accident Impact / Structural Damage';
    confidenceScore = 'high';
    possibleCauses = [
      'Collision damage to front bumper, radiator support, or axle',
      'Suspension tie rod or control arm fracture',
      'Frame deformation or fluid line severance'
    ];
    safetyAdvice = [
      'Verify the safety and physical condition of all occupants',
      'Exit vehicle safely and move behind safety barriers',
      'Do not attempt to drive if steering, wheel alignment, or fluid lines are compromised'
    ];
    recommendedSpecialization = ['Towing & Recovery', 'Collision Specialist', 'Chassis Alignment'];
    recommendedUrgency = 'emergency';
    detectedComponents = ['Bumper', 'Chassis', 'Suspension Arms'];
  } else {
    possibleCauses = [
      'Mechanical wear in drivetrain or braking components',
      'Sensor communication error across CAN bus network',
      'Underlying hardware breakdown requiring hands-on scan tool inspection'
    ];
    safetyAdvice = [
      'Turn on hazard warning lights',
      'Move to safe shoulder or designated emergency parking bay',
      'Await professional roadside inspection'
    ];
  }

  if (file) {
    detectedComponents.push(file.originalname);
  }

  return {
    predictedIssueType,
    issueTitle,
    confidenceScore,
    possibleCauses,
    safetyAdvice,
    recommendedSpecialization,
    recommendedUrgency,
    detectedComponents: detectedComponents.length > 0 ? detectedComponents : ['Under-hood / Chassis Component'],
    disclaimer: 'This is an automated preliminary assessment based on reported symptoms and images. A physical inspection by a qualified mechanic is necessary for an official diagnosis.'
  };
}

/**
 * Main Controller: Analyze breakdown symptoms and image
 * POST /api/ai/diagnose
 */
exports.diagnoseBreakdown = async (req, res) => {
  try {
    const { description = '', make = '', model = '', year = '' } = req.body;
    const vehicle = { make, model, year };
    const uploadedFile = req.file;

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyConfigured = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

    let imageUrl = '';
    if (uploadedFile) {
      imageUrl = `/uploads/${uploadedFile.filename}`;
    }

    // If API key is available, call Google Gemini Vision API
    if (isApiKeyConfigured) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        let imagePart = null;
        if (uploadedFile) {
          const filePath = uploadedFile.path;
          const imageBuffer = fs.readFileSync(filePath);
          imagePart = {
            inlineData: {
              mimeType: uploadedFile.mimetype,
              data: imageBuffer.toString('base64')
            }
          };
        }

        const promptText = `
You are MechMate AI, an expert automotive roadside breakdown triage assistant.
Analyze the following vehicle breakdown symptoms and/or attached component photo:
- Vehicle: ${year} ${make} ${model}
- Driver's Description: "${description}"

Provide an objective preliminary analysis.
You MUST reply with ONLY valid JSON (no markdown formatting, no code fences, no extra text) matching this schema:
{
  "predictedIssueType": "engine" | "tire" | "battery" | "fuel" | "accident" | "other",
  "issueTitle": "Concise summary of the likely problem",
  "confidenceScore": "high" | "medium" | "low",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "safetyAdvice": ["immediate safety precaution 1", "immediate safety precaution 2"],
  "recommendedSpecialization": ["specialization 1", "specialization 2"],
  "recommendedUrgency": "low" | "medium" | "high" | "emergency",
  "detectedComponents": ["component name identified from image/description"],
  "disclaimer": "This is an automated preliminary assessment based on reported symptoms and images. A physical inspection by a qualified mechanic is necessary for an official diagnosis."
}
`;

        const contents = imagePart ? [promptText, imagePart] : [promptText];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text ? response.text.trim() : '';
        // Strip markdown code fences if model enclosed them
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        // Ensure mandatory disclaimer
        parsed.disclaimer = parsed.disclaimer || 'This is an automated preliminary assessment based on reported symptoms and images. A physical inspection by a qualified mechanic is necessary for an official diagnosis.';

        return res.status(200).json({
          success: true,
          source: 'gemini',
          diagnosis: parsed,
          imageUrl: imageUrl || null
        });

      } catch (geminiError) {
        console.warn('Gemini API call failed or timed out, falling back to rule-based triage:', geminiError.message);
        // Seamless fallback to heuristic engine
        const fallbackDiagnosis = runRuleBasedDiagnosis(description, vehicle, uploadedFile);
        return res.status(200).json({
          success: true,
          source: 'heuristic_fallback',
          diagnosis: fallbackDiagnosis,
          imageUrl: imageUrl || null,
          note: 'Preliminary analysis generated via MechMate expert rules engine.'
        });
      }
    }

    // When no API key is provided, use the built-in heuristic triage
    const ruleDiagnosis = runRuleBasedDiagnosis(description, vehicle, uploadedFile);
    return res.status(200).json({
      success: true,
      source: 'heuristic_engine',
      diagnosis: ruleDiagnosis,
      imageUrl: imageUrl || null
    });

  } catch (error) {
    console.error('AI diagnosis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete breakdown diagnosis: ' + error.message
    });
  }
};
