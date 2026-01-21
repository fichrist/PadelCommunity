import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  link: string;
  backgroundColor: string;
}

const ads: Ad[] = [
  {
    id: "1",
    title: "Premium Padel Rackets",
    description: "Latest 2026 collection - Carbon fiber technology for ultimate control",
    image: "🎾",
    badge: "20% OFF",
    link: "#",
    backgroundColor: "bg-gradient-to-br from-blue-50 to-blue-100",
  },
  {
    id: "2",
    title: "Court Booking Special",
    description: "Book 5 sessions, get 1 free at premium indoor courts",
    image: "🏟️",
    badge: "EXCLUSIVE",
    link: "#",
    backgroundColor: "bg-gradient-to-br from-green-50 to-green-100",
  },
  {
    id: "3",
    title: "Padel Academy Training",
    description: "Professional coaching for all levels - First session free!",
    image: "🏆",
    badge: "NEW",
    link: "#",
    backgroundColor: "bg-gradient-to-br from-purple-50 to-purple-100",
  },
  {
    id: "4",
    title: "Spring Tournament 2026",
    description: "Register now for the regional championship - Prize pool €5000",
    image: "🥇",
    badge: "LIMITED",
    link: "#",
    backgroundColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
  },
  {
    id: "5",
    title: "Pro Padel Shoes",
    description: "Enhanced grip & stability - Designed by champions",
    image: "👟",
    badge: "SALE",
    link: "#",
    backgroundColor: "bg-gradient-to-br from-red-50 to-red-100",
  },
];

const Advertisement = () => {
  return (
    <div className="space-y-4 sticky top-6">
      <div className="text-sm font-semibold text-muted-foreground mb-3">
        SPONSORED
      </div>

      {ads.map((ad) => (
        <Card
          key={ad.id}
          className={`${ad.backgroundColor} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer`}
          onClick={() => window.open(ad.link, "_blank")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{ad.image}</span>
                <CardTitle className="text-base leading-tight">
                  {ad.title}
                </CardTitle>
              </div>
              {ad.badge && (
                <Badge variant="secondary" className="text-xs font-bold shrink-0">
                  {ad.badge}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              {ad.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(ad.link, "_blank");
              }}
            >
              Learn More
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="text-xs text-muted-foreground text-center pt-2">
        Advertisement • Support our community
      </div>
    </div>
  );
};

export default Advertisement;
