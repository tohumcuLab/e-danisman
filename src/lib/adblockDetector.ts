/**
 * Tarayıcıda AdBlock (reklam engelleyici) olup olmadığını tespit eden yardımcı fonksiyon.
 * iOS Safari'nin yerleşik Gizlilik ve İzleme Koruması'nı yanlışlıkla AdBlock sanmayacak şekilde optimize edilmiştir.
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. YÖNTEM: Reklam engelleyicilerin engellediği CSS sınıflarına sahip gizli bir bait (tuzak) elementi oluşturma
  try {
    const bait = document.createElement("div");
    bait.className = "adsbox adsbygoogle ad-placement doubleclick pub_300x250 pub_728x90 text-ad textAd text_ad text_ads text-ad-links banner-ad";
    bait.setAttribute("aria-hidden", "true");
    bait.style.position = "absolute";
    bait.style.top = "-9999px";
    bait.style.left = "-9999px";
    bait.style.width = "10px";
    bait.style.height = "10px";
    bait.style.pointerEvents = "none";
    document.body.appendChild(bait);

    // Tarayıcı layout hesaplamasını zorla
    const styles = window.getComputedStyle(bait);
    const isHidden =
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.clientHeight === 0 ||
      styles.display === "none" ||
      styles.visibility === "hidden";

    document.body.removeChild(bait);

    if (isHidden) {
      return true; // AdBlock CSS kuralları elementi gizledi
    }
  } catch (e) {
    // ignore
  }

  // 2. YÖNTEM: adsbygoogle nesnesinin varlığını ve engellenme durumunu kontrol etme
  try {
    const hasAdSenseScriptLoaded = Boolean(
      (window as any).adsbygoogle ||
      document.querySelector('script[src*="pagead2.googlesyndication.com"]')
    );

    // Eğer sayfa AdSense scriptini barındırıyorsa ancak global nesne engellenmişse kontrol et
    if (!hasAdSenseScriptLoaded) {
      const testUrl = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(testUrl, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return false;
      } catch (err: any) {
        clearTimeout(timeoutId);
        // AbortError veya generic iOS Safari tracking timeout durumlarında false pozitif vermeyi engelle
        if (err.name === "AbortError") {
          return false;
        }
        // Yalnızca net olarak istemci tarafı engelleme (ERR_BLOCKED_BY_CLIENT) tespit edildiğinde true dön
        if (err.message && (err.message.includes("BLOCKED_BY_CLIENT") || err.message.includes("blocked"))) {
          return true;
        }
      }
    }
  } catch {
    // ignore
  }

  return false;
}
