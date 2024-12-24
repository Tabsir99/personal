import React from "react";

// Define types for props
interface EditNameProps {
  status: "active" | "inactive";
  toggleStatus: () => void;
  categoryName: string;
  description: string;
  ModifyCategory: React.Dispatch<React.SetStateAction<Category>>;
}

interface SaveEditProps {
  setEditing: React.Dispatch<React.SetStateAction<EditingState>>;
  handleSave: () => void;
  ModifyCategory: React.Dispatch<React.SetStateAction<Category>>;
  unModifiedCategory: Category;
}

// Define types for the category and editing state
interface Category {
  categoryName: string;
  description: string;
}

interface EditingState {
  editing: boolean;
  deleting: boolean;
}

export const EditName = ({
  status,
  toggleStatus,
  categoryName,
  description,
  ModifyCategory,
}: EditNameProps) => {
  return (
    <>
      <div className="flex gap-5 items-start justify-between">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => {
            ModifyCategory((prev) => ({
              ...prev,
              categoryName: e.target.value,
            }));
          }}
          className="px-2 py-1 rounded-md bg-neutral-800/60 text-white border-none focus:ring-1 outline-none focus:ring-green-600 mb-2"
        />

        <button
          onClick={() => toggleStatus()}
          className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out bg-neutral-800/60 focus:outline-none"
        >
          <span
            className={`${
              status === "active"
                ? "translate-x-6 bg-green-600"
                : "translate-x-1 bg-red-500"
            } inline-block w-4 h-4 transform rounded-full transition-transform duration-300 ease-in-out`}
          />
        </button>
      </div>
      <textarea
        value={description}
        onChange={(e) => {
          ModifyCategory((prev) => ({
            ...prev,
            description: e.target.value,
          }));
        }}
        rows={2}
        className="px-2 py-1 w-full resize-none rounded-md mb-5 bg-neutral-800/60 text-white border-none focus:ring-1 outline-none focus:ring-green-600"
      />
    </>
  );
};

export const SaveEdit = ({
  setEditing,
  handleSave,
  ModifyCategory,
  unModifiedCategory,
}: SaveEditProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => {
          setEditing((prev) => ({
            ...prev,
            editing: false,
          }));
          ModifyCategory((prev) => ({
            ...prev,
            categoryName: unModifiedCategory.categoryName,
            description: unModifiedCategory.description,
          }));
        }}
        className="bg-gray-400 text-gray-800 transition-colors duration-300 active:scale-90 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md px-4 py-2 text-sm font-medium"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="bg-green-700 transition-colors duration-300 active:scale-90 text-white hover:bg-gray-600 focus:outline-none rounded-md px-4 py-2 text-sm font-medium"
      >
        Save
      </button>
    </div>
  );
};

