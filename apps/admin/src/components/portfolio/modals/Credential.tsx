import { useRef, useState } from "react";
import { Image as ImageIcon, Plus } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Eyebrow } from "@/components/ui/Eyebrow";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import Img from "@/components/ui/image";
import { PageData } from "@tabsircg/schemas/portfolio";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";

interface CredentialDialogProps {
  children: React.ReactNode;
}

const defaultFormData: PageData["credentials"][number] = {
  title: "",
  image: "",
  link: "",
  isActive: true,
  order: 0,
};

export default function CredentialDialog({ children }: CredentialDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const credential = usePortfolioStore().credentials;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    credential.add(formData);
    setFormData(defaultFormData);
  };

  return (
    <Dialog
      trigger={children as React.ReactElement | null}
      title="Add credential"
      description="Certificate-style asset. Just title + image + optional verify link."
      footer={(close) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleSubmit();
              close();
            }} 
            disabled={!formData.title}
            iconLeft={<Plus size={14} />}
          >
            Add credential
          </Button>
        </div>
      )}
    >
      <div className="space-y-5">
        <section title="Basics" className="space-y-6">
          <TextField
            id="credential-title"
            label="Title"
            placeholder="AWS Certified Developer"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </section>

        <section title="Media" className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm leading-none font-medium">Certificate image</label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="group/upload flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-foreground/6 bg-foreground/2 transition-colors hover:bg-foreground/4"
            >
              {formData.image ? (
                <Img
                  src={formData.image}
                  alt="Preview"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <ImageIcon size={20} className="text-muted-foreground/60" />
                  <Eyebrow tone="muted" family="mono">
                    Click to upload
                  </Eyebrow>
                </div>
              )}
            </div>
            <input
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
        </section>

        <section title="Reference" className="space-y-6">
          <TextField
            id="credential-verify"
            label="Verification link"
            helper="A public URL that proves the credential."
            placeholder="https://aws.amazon.com/verification/…"
            value={formData.link}
            onChange={(e) =>
              setFormData({ ...formData, link: e.target.value })
            }
            size="sm"
            className="font-mono"
          />
        </section>
      </div>
    </Dialog>
  );
}

