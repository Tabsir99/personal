
import WriteMetadataComp from "@/Components/write-post/writeMetadata";


export const metadata = {
  title: "Write Blog Metadata",
};

const WriteMetaData = async () => {

  return (
    <div className="p-6 bg-[rgb(12,12,12)] text-white min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">
          Write New Post (Enter MetaData)
        </h1>

        <WriteMetadataComp isSidebar={false} />
      </div>
    </div>
  );
};

export default WriteMetaData;
