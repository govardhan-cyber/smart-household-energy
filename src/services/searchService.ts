import { parseApplianceQuery, isApplianceQuery } from './applianceParser';
import { 
  estimateFromFallback, 
  validateSpec, 
  CATEGORY_TO_AUDIT_ID, 
  SUGGESTED_HOURS 
} from './energyEstimator';
import type { ApplianceSpec } from './energyEstimator';
import { findInCatalog } from './applianceCatalog';
import { getCachedResult, setCachedResult } from './cacheService';

export interface SearchResult {
  spec: ApplianceSpec;
  fromCache: boolean;
}

/**
 * Searches for an appliance by query. Uses cache, AI Gemini API, curated offline catalog, and fallback estimator.
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
    // If not detected by parser regex, check curated catalog first before generic fallback
    const catalogMatch = findInCatalog(query, parsed);
    if (catalogMatch) {
      const validated = validateSpec(catalogMatch);
      setCachedResult(query, validated);
      return { spec: validated, fromCache: false };
    }
    return { spec: validateSpec(estimateFromFallback(parsed)), fromCache: false };
  }

  const queryToSearch = parsed.cleanedQuery || query;
  const prompt = `You are an expert appliance specification database. 
I need detailed energy and power specifications for the following appliance based on user query: "${queryToSearch}".

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
    let jsonText = (aiResponseText || '').trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch && fenceMatch[1]) {
      jsonText = fenceMatch[1].trim();
    } else {
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      }
    }
    
    const parsedJson = JSON.parse(jsonText);
    
    const category = parsedJson.category || parsed.category || 'Unknown';
    const auditCategory = CATEGORY_TO_AUDIT_ID[category] || 'other';
    const suggestedDailyHours = SUGGESTED_HOURS[category] || 2;

    // If AI confidence was low or rated power was missing, check if our verified catalog has a high-confidence match
    if (parsedJson.confidence === 'low' || typeof parsedJson.ratedPowerW !== 'number') {
      const catalogMatch = findInCatalog(query, parsed);
      if (catalogMatch && catalogMatch.confidence === 'high') {
        const validatedCatalog = validateSpec(catalogMatch);
        setCachedResult(query, validatedCatalog);
        return { spec: validatedCatalog, fromCache: false };
      }
    }

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
    console.warn('[searchAppliance] Error fetching/parsing Gemini response, checking curated catalog / estimator:', error);
    
    // 1. Check curated offline catalog of verified Indian & global appliances
    const catalogMatch = findInCatalog(query, parsed);
    if (catalogMatch) {
      const validatedCatalog = validateSpec(catalogMatch);
      setCachedResult(query, validatedCatalog);
      return { spec: validatedCatalog, fromCache: false };
    }

    // 2. Intelligent BEE benchmark fallback
    const fallbackSpec = validateSpec(estimateFromFallback(parsed));
    setCachedResult(query, fallbackSpec);
    return { spec: fallbackSpec, fromCache: false };
  }
};
