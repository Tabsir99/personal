"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import useUIStore from "@/stores/UIStore";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";

export default function About() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const openModal = useUIStore.getState().openModal;

  const about = usePortfolioStore(useShallow((state) => state.pageData.about));
  const profilePicture = usePortfolioStore(
    useShallow((state) => state.pageData.profilePicture),
  );

  const updatePageData = usePortfolioStore.getState().updatePageData;

  const editor = useEditor({
    extensions: starterKitOptions,
    content: "",
  });

  const handleEdit = (index: number, content: string) => {
    setEditingIndex(index);
    editor?.commands.setContent(content);
  };

  const closeEditor = () => {
    setEditingIndex(null);
    editor?.commands.setContent("");
  };

  const handleSave = () => {
    if (editingIndex !== null && editor) {
      const newCards = [...about];
      newCards[editingIndex] = editor.getHTML();
      updatePageData({ about: newCards });
      closeEditor();
    }
  };

  const handleCancel = () => {
    closeEditor();
    if (about[editingIndex!] === "") {
      handleDelete(editingIndex!);
    }
  };

  const handleDelete = (index: number) => {
    const newCards = about.filter((_, i) => i !== index);
    updatePageData({
      about: newCards,
    });
  };

  const handleAddCard = () => {
    updatePageData({
      about: [...about, ""],
    });
    setEditingIndex(about.length);
    editor?.commands.setContent("");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      updatePageData({
        profilePicture: URL.createObjectURL(file),
      });
  };

  const handleMoveUp = (index: number) => {
    const newCards = [...about];
    const temp = newCards[index];
    newCards[index] = newCards[index - 1];
    newCards[index - 1] = temp;
    updatePageData({
      about: newCards,
    });
  };

  const handleMoveDown = (index: number) => {
    const newCards = [...about];
    const temp = newCards[index];
    newCards[index] = newCards[index + 1];
    newCards[index + 1] = temp;
    updatePageData({ about: newCards });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">About Sections</h2>
          <p className="text-white/50">Manage your about page content cards</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div className="space-y-6">
          {about.map((card, index) => (
            <Card
              key={index}
              className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm relative group"
            >
              {/* Action Buttons - Only show in view mode */}
              {editingIndex !== index && (
                <ActionButtonGroup
                  buttons={[
                    {
                      onClick: () => handleEdit(index, card),
                      variant: "edit",
                    },
                    {
                      onClick: () =>
                        openModal("confirmation", {
                          data: {
                            headerText: "Delete Section",
                            message:
                              "Are you sure you want to delete this section?",
                            onConfirm: () => handleDelete(index),
                          },
                        }),
                      variant: "delete",
                    },
                    {
                      onClick: () => handleMoveUp(index),
                      variant: "moveUp",
                      disabled: index === 0,
                    },
                    {
                      onClick: () => handleMoveDown(index),
                      variant: "moveDown",
                      disabled: index === about.length - 1,
                    },
                  ]}
                />
              )}

              <CardContent className="p-6 border-none overflow-hidden">
                {/* View Mode */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: editingIndex === index ? "0fr" : "1fr",
                  }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div
                      className="p-2 text-zinc-200"
                      dangerouslySetInnerHTML={{ __html: card }}
                    />
                  </div>
                </div>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: editingIndex === index ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">
                          Editing Section {index + 1}
                        </h3>

                        {editingIndex === index && (
                          <ActionButtonGroup
                            buttons={[
                              { onClick: handleSave, variant: "save" },
                              { onClick: handleCancel, variant: "cancel" },
                            ]}
                          />
                        )}
                      </div>
                    </div>
                    <EditorContent
                      editor={editingIndex === index ? editor : null}
                      style={{ scrollbarWidth: "none" }}
                      className="prose prose-sm max-w-full h-64 overflow-y-auto p-4 focus:outline-none text-zinc-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <AddCard
            title="Add Section"
            onClick={handleAddCard}
            className="min-h-0"
            description="Add a new section to your about page"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <Card className="border-gray-200 shadow-sm overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 cursor-pointer z-10 flex items-center justify-center">
                  <Button
                    size="sm"
                    className="gap-2 bg-white/90 text-black hover:bg-white"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Pencil size={16} />
                    Change Image
                  </Button>

                  <input
                    ref={imageInputRef}
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <Img
                  src={profilePicture}
                  alt="Tabsir - Full Stack Developer"
                  className="w-full h-full object-cover"
                  draggable="false"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-2xl font-bold text-white">Tabsir</h4>
                  <p className="text-white/80">Full Stack Developer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-700 bg-zinc-800/30 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-gray-200 mb-4 leading-relaxed">
                Passionate about Tech, Data, or AI? Working on something
                exciting?
              </p>
              <Button className="w-full gap-2 shadow-sm">Let's Connect</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
