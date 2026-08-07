import { parseApplianceQuery, isApplianceQuery } from './applianceParser';
import { 
  estimateFromFallback, 
  validateSpec, 
  CATEGORY_TO_AUDIT_ID, 
  SUGGESTED_HOURS 
} from './energyEstimator';
import type { ApplianceSpec } from './energyEstimator';
import { getCachedResult, setCachedResult } from './cacheService';

export interface SearchResult {
  spec: ApplianceSpec;
  fromCache: boolean;
}

/**
 * Searches for an appliance by query. Uses cache, AI Gemini API, and fallback estimator.
 */
export const searchAppliance = async (
  query: string,
  queryGemini: (prompt: string) => Promise<string>
): Promise<SearchResult> => {
  const cached = getCachedResult(query);
  if (cached) {
    return { spec: cached, fromCache: true };
  }

  const parsed = parseApplianceQuery(query);
  if (!isApplianceQuery(parsed)) {
    // If we can't detect it, still attempt fallback or return a generic unknown.
    return { spec: validateSpec(estimateFromFallback(parsed)), fromCache: false };
  }

  const prompt = `You are an expert appliance specification database. 
I need detailed energy and power specifications for the following appliance based on user query: "${query}".

Extracted Info:
- Brand: ${parsed.brand || 'Unknown'}
- Model: ${parsed.model || 'Unknown'}
- Category: ${parsed.category || 'Unknown'}
- Capacity: ${parsed.capacity || 'Unknown'}
- Technology: ${parsed.technology || 'Unknown'}
- Star Rating: ${parsed.starRating || 'Unknown'}

Search Priorities:
1. Official manufacturer website
2. Government energy label database (like BEE India)
3. Trusted retailers (Amazon, Flipkart)
4. Energy databases

Respond ONLY with a valid JSON object matching the following structure exactly. Do not include markdown formatting or \`\`\`json blocks.
{
  "name": "Full product name",
  "brand": "Brand name or Generic",
  "model": "Model number or Unknown",
  "category": "Appliance category",
  "ratedPowerW": 1500,
  "operatingPowerW": 1200,
  "standbyPowerW": 2,
  "annualEnergyKwh": 500,
  "energyStarRating": 5,
  "capacity": "Capacity string or null",
  "voltage": "Voltage string, usually 230V",
  "productUrl": "URL string or null",
  "imageUrl": "Image URL or null",
  "confidence": "high",
  "confidenceReason": "Brief explanation of how the data was sourced",
  "source": "Source name"
}

Confidence should be "high" (exact model found), "medium" (closest model matched), or "low" (estimated from similar products).
You must ALWAYS return a complete JSON result even if you have to estimate (use "low" confidence). NEVER return empty or unknown.`;

  try {
    const aiResponseText = await queryGemini(prompt);
    
    // Parse the JSON from the response robustly
    let jsonText = aiResponseText.trim();
    // Remove markdown code fences if present
    if (jsonText.startsWith('\`\`\`')) {
      const match = jsonText.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/);
      if (match && match[1]) {
        jsonText = match[1].trim();
      }
    }
    
    const parsedJson = JSON.parse(jsonText);
    
    const category = parsedJson.category || parsed.category || 'Unknown';
    const auditCategory = CATEGORY_TO_AUDIT_ID[category] || 'other';
    const suggestedDailyHours = SUGGESTED_HOURS[category] || 2;

    const spec: ApplianceSpec = validateSpec({
      name: parsedJson.name || `${parsed.brand || 'Generic'} ${category}`,
      brand: parsedJson.brand || parsed.brand || 'Generic',
      model: parsedJson.model || parsed.model || 'Unknown',
      category: category,
      ratedPowerW: typeof parsedJson.ratedPowerW === 'number' ? parsedJson.ratedPowerW : 100,
      operatingPowerW: typeof parsedJson.operatingPowerW === 'number' ? parsedJson.operatingPowerW : null,
      standbyPowerW: typeof parsedJson.standbyPowerW === 'number' ? parsedJson.standbyPowerW : null,
      annualEnergyKwh: typeof parsedJson.annualEnergyKwh === 'number' ? parsedJson.annualEnergyKwh : null,
      energyStarRating: typeof parsedJson.energyStarRating === 'number' ? parsedJson.energyStarRating : null,
      capacity: parsedJson.capacity || parsed.capacity || null,
      voltage: parsedJson.voltage || '230V',
      productUrl: parsedJson.productUrl || null,
      imageUrl: parsedJson.imageUrl || null,
      confidence: parsedJson.confidence || 'low',
      confidenceReason: parsedJson.confidenceReason || 'AI generated response',
      source: parsedJson.source || 'AI Estimator',
      suggestedDailyHours,
      auditCategory
    });

    setCachedResult(query, spec);
    return { spec, fromCache: false };

  } catch (error) {
    console.error('Error fetching/parsing Gemini response, falling back to estimator', error);
    const fallbackSpec = validateSpec(estimateFromFallback(parsed));
    return { spec: fallbackSpec, fromCache: false };
  }
};
