import { useRef, useState } from "react";
import { Image as ImageIcon, Plus } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Eyebrow } from "@/components/ui/Eyebrow";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import Img from "@/components/ui/image";
import { PageData } from "@tabsircg/schemas/portfolio";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";

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
    <PortfolioModalFrame
      trigger={children}
      title="Add credential"
      description="Certificate-style asset. Just title + image + optional verify link."
      footer={(close) => (
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={!formData.title}
          submitLabel="Add credential"
          updateLabel="Add credential"
          submitIcon={<Plus size={14} />}
          close={close}
        />
      )}
    >
      <ModalSection title="Basics">
        <TextField
          id="credential-title"
          label="Title"
          placeholder="AWS Certified Developer"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </ModalSection>

      <ModalSection title="Media">
        <div className="space-y-1.5">
          <label className="text-sm font-medium leading-none">Certificate image</label>
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
      </ModalSection>

      <ModalSection title="Reference">
        <TextField
          id="credential-verify"
          label="Verification link"
          helper="A public URL that proves the credential."
          placeholder="https://aws.amazon.com/verification/…"
          value={formData.link}
          onChange={(e) =>
            setFormData({ ...formData, link: e.target.value })
          }
          className="font-mono text-xs"
        />
      </ModalSection>
    </PortfolioModalFrame>
  );
}

