import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  timeAgo: string;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ReviewModal = ({ open, onOpenChange, eventTitle, reviews, averageRating, totalReviews }: ReviewModalProps) => {
  const renderStars = (rating: number, className = "h-4 w-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${className} ${
          i < rating ? "text-yellow-400 fill-current" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Reviews for "{eventTitle}"</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-sm font-medium">{averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-muted-foreground">({totalReviews} reviews)</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {reviews?.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.author.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {review.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">{review.author.name}</span>
                    <div className="flex items-center">
                      {renderStars(review.rating, "h-3 w-3")}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.timeAgo}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;