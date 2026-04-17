import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";

interface AnimalImage {
  image_url: string;
  image_type: string;
  description?: string;
}

interface AnimalImageGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  images?: AnimalImage[];
}

const AnimalImageGallery = ({ open, onOpenChange, title, images }: AnimalImageGalleryProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
        </DialogHeader>
        {images && images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx}>
                  <div className="space-y-2">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={img.image_url}
                        alt={img.description || `Image ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="capitalize">
                        {img.image_type?.replace(/_/g, ' ') || 'Photo'}
                      </Badge>
                      <span className="text-muted-foreground">
                        {idx + 1} / {images.length}
                      </span>
                    </div>
                    {img.description && (
                      <p className="text-sm text-muted-foreground">{img.description}</p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No images uploaded</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnimalImageGallery;
