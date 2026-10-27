/**
 * Flipkart URL Helper: Validates Flipkart URLs and extracts product identifier
 */

export interface FlipkartUrlValidationResult {
  valid: boolean;
  cleanUrl?: string;
  productId?: string;
  error?: string;
}

export function validateAndExtractFlipkartUrl(rawInput: string): FlipkartUrlValidationResult {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      valid: false,
      error: 'Please provide a valid Flipkart product URL or Product ID (PID).',
    };
  }

  let input = rawInput.trim();

  // 1. Direct PID input (e.g. TWCH4F6HYUYZXX7H, ACCG..., MOBG..., or itm...)
  if (/^[A-Za-z0-9]{12,20}$/.test(input) && !input.includes('/') && !input.includes('.')) {
    const pid = input.toUpperCase();
    return {
      valid: true,
      productId: pid,
      cleanUrl: `https://www.flipkart.com/product/p/item?pid=${pid}`,
    };
  }

  // 2. Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(input)) {
    input = 'https://' + input;
  }

  // Validate basic URL protocol
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input);
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format. Please provide a full URL or product ID.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isFlipkart =
    hostname === 'flipkart.com' ||
    hostname.endsWith('.flipkart.com') ||
    hostname === 'fkrt.it' ||
    hostname.endsWith('.fkrt.it');

  if (!isFlipkart) {
    // If not flipkart domain, check if PID param exists anyway
    const directPid = parsedUrl.searchParams.get('pid');
    if (directPid && directPid.trim().length >= 8) {
      return {
        valid: true,
        productId: directPid.trim(),
        cleanUrl: `https://www.flipkart.com/product/p/item?pid=${directPid.trim()}`,
      };
    }

    return {
      valid: false,
      error: 'The provided URL is not a recognized Flipkart marketplace domain.',
    };
  }

  // Extract PID from query params (e.g. ?pid=ACCG... or &pid=TWCH...)
  const pidParam = parsedUrl.searchParams.get('pid');
  if (pidParam && pidParam.trim().length >= 8) {
    return {
      valid: true,
      productId: pidParam.trim(),
      cleanUrl: `${parsedUrl.origin}${parsedUrl.pathname}?pid=${pidParam.trim()}`,
    };
  }

  // Extract item ID from pathname (e.g. /p/itm... or /product-reviews/itm...)
  const itemMatch = parsedUrl.pathname.match(/\/(?:p|product-reviews)\/(itm[a-zA-Z0-9]+)/i);
  if (itemMatch && itemMatch[1]) {
    return {
      valid: true,
      productId: itemMatch[1],
      cleanUrl: `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`,
    };
  }

  // Extract from general product pathname if has /p/
  if (parsedUrl.pathname.includes('/p/')) {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const pIdx = segments.indexOf('p');
    if (pIdx !== -1 && segments[pIdx + 1]) {
      return {
        valid: true,
        productId: segments[pIdx + 1],
        cleanUrl: `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`,
      };
    }
  }

  // Check if any alphanumeric 16-char token exists in the URL
  const pidMatch = input.match(/(?:pid=|item\/|\/)([A-Z0-9]{14,18})(?:[?&#/]|$)/i);
  if (pidMatch && pidMatch[1]) {
    return {
      valid: true,
      productId: pidMatch[1],
      cleanUrl: input.includes('flipkart.com') ? input : `https://www.flipkart.com/product/p/item?pid=${pidMatch[1]}`,
    };
  }

  return {
    valid: false,
    error: 'Could not extract a valid Flipkart product identifier (PID or item ID) from the URL.',
  };
}
