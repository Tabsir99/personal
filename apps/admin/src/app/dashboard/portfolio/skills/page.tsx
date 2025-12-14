"use client";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import SkillCategoryDialog from "@/components/portfolio/modals/SkillCategory";
import { Input } from "@/components/ui/input";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";

export default function Skills() {
  const [addingSkillTo, setAddingSkillTo] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: 50,
    icon: "",
  });

  const skillCategories = usePortfolioStore(
    useShallow((state) => state.pageData.skills)
  );

  const skill = usePortfolioStore().skills;

  const handleAddSkill = (categoryIndex: number) => {
    if (newSkill.name.trim() && newSkill.icon.trim()) {
      skill.update(categoryIndex, {
        ...skillCategories[categoryIndex],
        skills: [...skillCategories[categoryIndex].skills, newSkill],
      });
      setNewSkill({
        name: "",
        level: 50,
        icon: "",
      });
      setAddingSkillTo(null);
    }
  };

  const handleCancelAddSkill = () => {
    setAddingSkillTo(null);
    setNewSkill({
      name: "",
      level: 50,
      icon: "",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Skills</h2>
          <p className="text-muted-foreground">
            Manage your technical skills and proficiency levels
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        {skillCategories.map((categoryItem, categoryIndex) => (
          <Card
            key={categoryItem.title}
            className="group relative border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300 hover:border-white/[0.12] rounded-2xl"
          >
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
                  active: categoryItem.isActive,
                },
                {
                  variant: "edit",
                  onClick: () => setAddingSkillTo(categoryIndex),
                },
                {
                  variant: "delete",
                  onClick: () => skill.delete(categoryIndex),
                },
              ]}
              entityName="Skill Category"
            />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:ring-white/20">
                  <Img
                    width={28}
                    height={28}
                    src={categoryItem.icon}
                    alt={categoryItem.title}
                    fetchPriority="low"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white/95">
                  {categoryItem.title}
                </h3>
              </div>

              <div className="space-y-4">
                {categoryItem.skills.map((skillItem, skillIndex) => {
                  return (
                    <div
                      key={skillItem.name}
                      className="group/skill transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Img
                            width={20}
                            height={20}
                            src={skillItem.icon}
                            alt={skillItem.name}
                            fetchPriority="low"
                            loading="lazy"
                          />
                          <span className="text-white/80 text-sm font-medium">
                            {skillItem.name}
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 rounded-full flex items-center justify-between gap-4">
                        <div className="flex-1  rounded-full overflow-hidden h-full">
                          <div
                            className="h-full bg-gradient-to-r from-transparent to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${skillItem.level}%` }}
                          />
                        </div>
                        <span className="text-white/50 text-xs min-w-[35px] text-right">
                          {skillItem.level}%
                        </span>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            skill.update(categoryIndex, {
                              ...skillCategories[categoryIndex],
                              skills: skillCategories[
                                categoryIndex
                              ].skills.filter((_, i) => i !== skillIndex),
                            })
                          }
                          className="h-7 w-7 opacity-0 group-hover/skill:opacity-100 bg-white/5 backdrop-blur-sm hover:bg-red-500/90 text-white/60 hover:text-white border border-white/10 hover:border-red-400/50 transition-all duration-300 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Skill Form */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{
                  gridTemplateRows:
                    addingSkillTo === categoryIndex ? "1fr" : "0fr",
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="mt-8">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Skill name"
                          value={newSkill.name}
                          onChange={(e) =>
                            setNewSkill({ ...newSkill, name: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Icon URL"
                          value={newSkill.icon}
                          onChange={(e) =>
                            setNewSkill({ ...newSkill, icon: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/60">
                            Proficiency Level
                          </span>
                          <span className="text-xs font-medium text-white/80">
                            {newSkill.level}%
                          </span>
                        </div>
                        <Slider
                          value={[newSkill.level]}
                          onValueChange={(value) =>
                            setNewSkill({ ...newSkill, level: value[0] })
                          }
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddSkill(categoryIndex)}
                          className="flex-1"
                          disabled={!newSkill.name || !newSkill.icon}
                        >
                          <Check size={14} />
                          Add Skill
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelAddSkill}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Skill Button */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{
                  gridTemplateRows:
                    addingSkillTo === categoryIndex ? "0fr" : "1fr",
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="mt-8">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-dashed text-white/80"
                      onClick={() => setAddingSkillTo(categoryIndex)}
                    >
                      <Plus size={14} />
                      Add Skill
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <SkillCategoryDialog>
          <AddCard title="Add Category" className="min-h-full" />
        </SkillCategoryDialog>
      </div>
    </div>
  );
}

{
  /* <Button
size="icon"
variant="ghost"
className=" h-7 w-7 opacity-0 group-hover/skill:opacity-100 bg-white/5 backdrop-blur-sm hover:bg-red-500/90 text-white/60 hover:text-white border border-white/10 hover:border-red-400/50 transition-all duration-300 rounded-lg"
onClick={() =>
  showConfirmation({
    headerText: "Delete Skill",
    message:
      "Are you sure you want to delete this skill?",
    onConfirm: () =>
      skill.update(categoryIndex, {
        ...skillCategories[categoryIndex],
        skills: skillCategories[
          categoryIndex
        ].skills.filter((_, i) => i !== skillIndex),
      }),
  })
}
>
<Trash2 className="h-3.5 w-3.5" />
</Button> */
}
