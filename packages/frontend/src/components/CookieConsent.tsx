import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "padel_community_cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          <p>
            Wij gebruiken cookies en locatiegegevens om de afstand tot events te berekenen en je een gepersonaliseerde ervaring te bieden.
            Je gegevens worden nooit gedeeld met derden.{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Lees ons privacybeleid
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={declineCookies}>
            Weigeren
          </Button>
          <Button size="sm" onClick={acceptCookies}>
            Accepteren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
