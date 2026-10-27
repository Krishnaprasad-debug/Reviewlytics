/**
 * Helper utilities for Amazon Product URL parsing and ASIN validation
 */

export interface AmazonUrlValidationResult {
  valid: boolean;
  asin?: string;
  domain?: string;
  cleanUrl?: string;
  error?: string;
}

const AMAZON_DOMAIN_REGEX = /(?:^|\.)amazon\.(com|in|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|com\.mx|com\.br|nl|se|pl|sa|ae|sg|com\.tr|com\.be|[a-z]{2,3}(?:\.[a-z]{2})?)$/i;
const SHORT_DOMAIN_REGEX = /(?:^|\.)(amzn\.to|amzn\.in|a\.co)$/i;

/**
 * Validates whether the given string is a legitimate Amazon product URL or ASIN
 * and extracts the 10-character Amazon Standard Identification Number (ASIN)
 * and marketplace domain.
 */
export async function validateAndExtractAmazonUrl(rawInput: string): Promise<AmazonUrlValidationResult> {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      valid: false,
      error: 'Please provide a valid Amazon product URL or 10-character ASIN.',
    };
  }

  let input = rawInput.trim();

  // 1. Direct ASIN input (e.g. B0GZMYP6Y6 or B0FC2Y3K5T)
  if (/^[A-Z0-9]{10}$/i.test(input)) {
    const asin = input.toUpperCase();
    return {
      valid: true,
      asin,
      domain: 'in',
      cleanUrl: `https://www.amazon.in/dp/${asin}`,
    };
  }

  // 2. Prepend https:// if protocol is omitted (e.g. "amazon.in/dp/..." or "amzn.to/...")
  if (!/^https?:\/\//i.test(input)) {
    input = 'https://' + input;
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format. Please provide a valid Amazon URL or 10-character ASIN.',
    };
  }

  let hostname = parsed.hostname.toLowerCase();

  // 3. Resolve short links (amzn.in, amzn.to, a.co)
  if (SHORT_DOMAIN_REGEX.test(hostname)) {
    try {
      const response = await fetch(input, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (response.url && response.url !== input) {
        input = response.url;
        parsed = new URL(input);
        hostname = parsed.hostname.toLowerCase();
      }
    } catch (err) {
      console.warn('[AmazonUrlHelper] Failed to resolve short link redirect, attempting direct parse:', err);
    }
  }

  // 4. Validate Amazon domain
  const domainMatch = hostname.match(AMAZON_DOMAIN_REGEX);
  let domain = 'in';

  if (domainMatch) {
    domain = domainMatch[1].toLowerCase();
  } else if (!SHORT_DOMAIN_REGEX.test(hostname)) {
    // Check if input URL has any Amazon query parameters or path hints
    if (!hostname.includes('amazon') && !hostname.includes('amzn')) {
      return {
        valid: false,
        error: 'The provided URL is not a recognized Amazon marketplace domain.',
      };
    }
  }

  let asin: string | null = null;

  // 5. Pattern matching from pathname
  const pathname = parsed.pathname;

  const asinPatterns = [
    /\/(?:dp|gp\/product|gp\/aw\/d|product-reviews|d|exec\/obidos\/ASIN|o\/ASIN)\/([A-Z0-9]{10})(?:[/?#&]|$)/i,
    /\/dp\/product-description\/([A-Z0-9]{10})(?:[/?#&]|$)/i,
    /\/(?:deal|item|offer-listing)\/(?:dp\/)?([A-Z0-9]{10})(?:[/?#&]|$)/i,
    /\/([A-Z0-9]{10})(?:[/?#&]|$)/i,
  ];

  for (const pattern of asinPatterns) {
    const match = pathname.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].toUpperCase();
      if (/^[A-Z0-9]{10}$/.test(candidate)) {
        asin = candidate;
        break;
      }
    }
  }

  // 6. Check URL search parameters (e.g. ?asin=B0... or ?pd_rd_i=B0...)
  if (!asin) {
    const candidateParams = ['asin', 'pd_rd_i', 'asins', 'productId'];
    for (const param of candidateParams) {
      const val = parsed.searchParams.get(param);
      if (val && /^[A-Z0-9]{10}$/i.test(val.trim())) {
        asin = val.trim().toUpperCase();
        break;
      }
    }
  }

  // 7. Generic scan for any standard modern B0 ASIN token in the entire URL string
  if (!asin) {
    const b0Match = input.match(/(?:^|[^A-Z0-9])(B0[A-Z0-9]{8})(?:[^A-Z0-9]|$)/i);
    if (b0Match && b0Match[1]) {
      asin = b0Match[1].toUpperCase();
    }
  }

  if (!asin) {
    return {
      valid: false,
      error: 'Could not extract a valid 10-character Amazon ASIN from the provided URL.',
    };
  }

  const cleanDomain = domainMatch && domainMatch[0] ? (domainMatch[0].startsWith('.') ? domainMatch[0].slice(1) : domainMatch[0]) : `amazon.${domain}`;
  const cleanUrl = `https://www.${cleanDomain}/dp/${asin}`;

  return {
    valid: true,
    asin,
    domain,
    cleanUrl,
  };
}
