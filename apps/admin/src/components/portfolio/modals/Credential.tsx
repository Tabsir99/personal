import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import Img from "@/components/ui/image";
import { PageData } from "@/types/portfolioTypes";

interface CredentialDialogProps {
  children: React.ReactNode;
}

const defaultFormData: PageData["credentials"][number] = {
  title: "",
  issuer: "",
  date: "",
  description: "",
  link: "",
  image: "",
  isActive: true,
};

export default function CredentialDialog({ children }: CredentialDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);

  const credential = usePortfolioStore().credentials;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    credential.add(formData);
    setFormData(defaultFormData);
  };

  return (
    <Dialog>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Credential</DialogTitle>
          <DialogDescription>
            Add a new certification or achievement to your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Certificate Image */}
          <div>
            <Label className="mb-2 block">Certificate Image</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-full min-h-40 cursor-pointer bg-zinc-800/50 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center overflow-hidden"
              >
                {formData.image ? (
                  <Img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-muted-foreground" />
                )}
              </div>

              <Input
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      image: URL.createObjectURL(file),
                    });
                  }
                }}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Certificate Title</Label>
              <Input
                placeholder="AWS Certified Developer"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Issuing Organization</Label>
                <Input
                  placeholder="Amazon Web Services"
                  value={formData.issuer}
                  onChange={(e) =>
                    setFormData({ ...formData, issuer: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Issue Date</Label>
                <div className="relative">
                  <Input
                    placeholder="2024"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  e.g., "2024" or "January 2024"
                </p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Description</Label>
              <Textarea
                placeholder="Professional certification for AWS development..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block">Certificate Link</Label>
              <Input
                placeholder="https://aws.amazon.com/verification/..."
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to verify or view the certificate
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <DialogClose
            render={
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.title ||
                  !formData.issuer ||
                  !formData.date ||
                  !formData.description
                }
              >
                Add Credential
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
