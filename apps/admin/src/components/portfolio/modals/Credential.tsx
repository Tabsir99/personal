import { useRef, useState } from "react";
import { Image as ImageIcon, Calendar, Plus } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import Img from "@/components/ui/image";
import { PageData } from "@tabsircg/schemas/portfolio";

import { ModalSection } from "./_shared";

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
    <Dialog>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-y-auto pb-0">
        <DialogHeader>
          <Eyebrow tone="muted" family="mono">
            New credential
          </Eyebrow>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Add credential
          </DialogTitle>
          <DialogDescription>
            Certifications, awards, or anything you want to prove.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ModalSection eyebrow="Basics">
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

          <ModalSection eyebrow="Media">
            <FormField label="Certificate image">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="group/upload flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-foreground/[0.06] bg-foreground/[0.02] transition-colors hover:bg-foreground/[0.04]"
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

          <ModalSection eyebrow="Reference">
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
        </div>

        <DialogFooter className="sticky bottom-0 bg-inherit">
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
                <Plus className="h-3.5 w-3.5" />
                Add credential
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
