"use client";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Check, Code, Plus, Trash2, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { ConfigMultiSelect } from "@/components/ui/configMultiSelect";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import {
  addPortfolioSkill,
  type PortfolioCatalog,
} from "@/actions/configActions";
import SkillCategoryDialog from "@/components/portfolio/modals/SkillCategory";
import { cn } from "@/lib/utils";

interface SkillDraft {
  name: string;
  level: number;
  icon: string;
}

const EMPTY_DRAFT: SkillDraft = { name: "", level: 50, icon: "" };

export default function Skills() {
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState<SkillDraft>(EMPTY_DRAFT);

  const skillCategories = usePortfolioStore(
    useShallow((state) => state.pageData.skills),
  );
  const skill = usePortfolioStore().skills;

  const { data: catalog, mutate: mutateCatalog, isLoading: catalogLoading } =
    useCustomSWR<PortfolioCatalog>("/api/config/portfolio");

  const commitNew = (categoryIndex: number) => {
    if (!newSkill.name.trim() || !newSkill.icon.trim()) return;
    skill.update(categoryIndex, {
      ...skillCategories[categoryIndex],
      skills: [...skillCategories[categoryIndex].skills, newSkill],
    });
    setNewSkill(EMPTY_DRAFT);
    setAddingTo(null);
  };

  const cancelNew = () => {
    setAddingTo(null);
    setNewSkill(EMPTY_DRAFT);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Technical skills
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Grouped categories with per-skill proficiency.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {skillCategories.map((category, categoryIndex) => (
          <div
            key={category.title + categoryIndex}
            style={{ ["--stagger-index" as string]: categoryIndex }}
          >
            <Card className="group/category relative tactile-lift">
              <ActionButtonGroup
                buttons={[
                  {
                    variant: "moveUp",
                    onClick: () => skill.moveUp(categoryIndex),
                    disabled: categoryIndex === 0,
                  },
                  {
                    variant: "moveDown",
                    onClick: () => skill.moveDown(categoryIndex),
                    disabled: categoryIndex === skillCategories.length - 1,
                  },
                  {
                    variant: "toggle",
                    onClick: () => skill.toggle(categoryIndex, "isActive"),
                    active: category.isActive,
                  },
                  {
                    variant: "edit",
                    onClick: () => setAddingTo(categoryIndex),
                  },
                  {
                    variant: "delete",
                    onClick: () => skill.delete(categoryIndex),
                  },
                ]}
                entityName="Skill Category"
              />
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.02] p-2">
                    <Img
                      width={24}
                      height={24}
                      src={category.icon}
                      alt={category.title}
                      fetchPriority="low"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-base leading-snug font-semibold tracking-tight">
                    {category.title}
                  </h3>
                </div>

                <ul className="flex flex-col gap-3">
                  {category.skills.map((skillItem, skillIndex) => (
                    <li
                      key={skillItem.name}
                      className="group/skill flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Img
                            width={16}
                            height={16}
                            src={skillItem.icon}
                            alt={skillItem.name}
                            fetchPriority="low"
                            loading="lazy"
                          />
                          <span className="truncate text-sm font-medium text-foreground">
                            {skillItem.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                            {skillItem.level}%
                          </span>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              skill.update(categoryIndex, {
                                ...skillCategories[categoryIndex],
                                skills: skillCategories[
                                  categoryIndex
                                ].skills.filter((_, i) => i !== skillIndex),
                              })
                            }
                            className="opacity-0 hover:bg-destructive/[0.08] hover:text-destructive group-hover/skill:opacity-100 focus-visible:opacity-100"
                            aria-label={`Remove ${skillItem.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${skillItem.level}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{
                    gridTemplateRows: addingTo === categoryIndex ? "1fr" : "0fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-6 space-y-3 rounded-md border border-foreground/[0.06] bg-foreground/[0.02] p-3">
                      <FormField label="Skill">
                        <ConfigMultiSelect
                          mode="single"
                          value={newSkill.name ? [newSkill.name] : []}
                          onChange={(next) =>
                            setNewSkill({ ...newSkill, name: next[0] ?? "" })
                          }
                          available={catalog?.skillCatalog ?? []}
                          loading={catalogLoading}
                          onCreate={addPortfolioSkill}
                          onOptimisticCreate={(values) =>
                            mutateCatalog(
                              (prev) =>
                                prev
                                  ? { ...prev, skillCatalog: values }
                                  : { skillCatalog: values, clientTypeCatalog: [] },
                              false,
                            )
                          }
                          onAfterCreate={(values) =>
                            mutateCatalog(
                              (prev) =>
                                prev
                                  ? { ...prev, skillCatalog: values }
                                  : { skillCatalog: values, clientTypeCatalog: [] },
                              false,
                            )
                          }
                          placeholder="Pick or create a skill…"
                          searchPlaceholder="Search or create a skill…"
                          itemIcon={Code}
                          toastMessages={{
                            loading: "Creating skill…",
                            success: "Skill added to catalog",
                            err: "Failed to create skill",
                          }}
                        />
                      </FormField>
                      <FormField label="Icon URL">
                        <Input
                          placeholder="https://…/icon.png"
                          value={newSkill.icon}
                          onChange={(e) =>
                            setNewSkill({ ...newSkill, icon: e.target.value })
                          }
                          className="font-mono text-xs"
                        />
                      </FormField>
                      <FormField
                        label={
                          <span className="inline-flex items-center justify-between gap-2 w-full">
                            <span>Proficiency</span>
                            <span className="font-mono normal-case tabular-nums tracking-normal text-foreground/80">
                              {newSkill.level}%
                            </span>
                          </span>
                        }
                      >
                        <Slider
                          value={[newSkill.level]}
                          onValueChange={(value) =>
                            setNewSkill({
                              ...newSkill,
                              level: value[0] ?? 0,
                            })
                          }
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </FormField>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          size="sm"
                          onClick={() => commitNew(categoryIndex)}
                          className="flex-1"
                          disabled={!newSkill.name || !newSkill.icon}
                        >
                          <Check className="h-3 w-3" />
                          Add skill
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={cancelNew}
                          aria-label="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {addingTo !== categoryIndex && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddingTo(categoryIndex)}
                    className={cn(
                      "mt-5 w-full text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    Add skill
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        <SkillCategoryDialog>
          <AddCard title="Add category" className="min-h-full" />
        </SkillCategoryDialog>
      </div>
    </div>
  );
}
