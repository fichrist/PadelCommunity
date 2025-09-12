import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  imageAlt: string;
  title?: string;
}

const ImageModal = ({ open, onOpenChange, imageSrc, imageAlt, title }: ImageModalProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageAlt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header with close button and actions */}
        <div className="absolute top-3 right-3 z-50 flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 p-0 bg-black/60 backdrop-blur-sm hover:bg-black/80 border-0"
          >
            <Download className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 bg-black/60 backdrop-blur-sm hover:bg-black/80 border-0"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Title overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}

        {/* Image */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;