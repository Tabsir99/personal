import type { PostMeta } from "@/lib/posts";
import Filters from "./Filters";
import PostRow from "./PostRow";

export default function BlogArchive({
  posts,
  tags,
  active,
}: {
  posts: PostMeta[];
  tags: string[];
  active: string;
}) {
  return (
    <div className="flex flex-col">
      <Filters tags={tags} active={active} count={posts.length} />
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted grid gap-4 place-items-center">
          <div className="text-[96px] leading-none text-cream/8 font-thin">
            ∅
          </div>
          <div>
            nothing tagged{" "}
            <code className="font-mono text-accent">#{active}</code> yet — try
            another?
          </div>
        </div>
      ) : (
        posts.map((p, i) => <PostRow key={p.slug} post={p} idx={i} />)
      )}
    </div>
  );
}
