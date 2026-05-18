import { useRef, useState } from "react";
import { Image as ImageIcon, Calendar, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
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

  const handleSubmit = () => {
    credential.add(formData);
    setFormData(defaultFormData);
  };

  return (
    <PortfolioModalFrame
      trigger={children}
      title="Add credential"
      description="Certifications, awards, or anything you want to prove."
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={
            !formData.title ||
            !formData.issuer ||
            !formData.date ||
            !formData.description
          }
          submitLabel="Add credential"
          updateLabel="Add credential"
          submitIcon={<Plus className="h-3.5 w-3.5" />}
        />
      }
    >
      <ModalSection title="Basics">
        <FormField label="Title">
          <Input
            placeholder="AWS Certified Developer"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Issuer">
            <Input
              placeholder="Amazon Web Services"
              value={formData.issuer}
              onChange={(e) =>
                setFormData({ ...formData, issuer: e.target.value })
              }
            />
          </FormField>
          <FormField
            label="Issue date"
            hint={"e.g. “2024” or “January 2024”"}
          >
            <div className="relative">
              <Input
                placeholder="2024"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <Calendar
                className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60"
                aria-hidden="true"
              />
            </div>
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            placeholder="Professional certification for AWS development…"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </FormField>
      </ModalSection>

      <ModalSection title="Media">
        <FormField label="Certificate image">
          <div
            onClick={() => imageInputRef.current?.click()}
            className="group/upload flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-foreground/6 bg-foreground/2 transition-colors hover:bg-foreground/4"
          >
            {formData.image ? (
              <Img
                src={formData.image}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                <Eyebrow tone="muted" family="mono">
                  Click to upload
                </Eyebrow>
              </div>
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
        </FormField>
      </ModalSection>

      <ModalSection title="Reference">
        <FormField
          label="Verification link"
          hint="A public URL that proves the credential."
        >
          <Input
            placeholder="https://aws.amazon.com/verification/…"
            value={formData.link}
            onChange={(e) =>
              setFormData({ ...formData, link: e.target.value })
            }
            className="font-mono text-xs"
          />
        </FormField>
      </ModalSection>
    </PortfolioModalFrame>
  );
}
