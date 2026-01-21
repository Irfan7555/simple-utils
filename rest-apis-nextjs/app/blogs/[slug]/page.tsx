import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBlogById } from "../../lib/api";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = params;
  const id = parseInt(slug);

  if (isNaN(id)) {
    return notFound();
  }

  try {
    const blog = await fetchBlogById(id);

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/blogs" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to Blogs
        </Link>
        <article className="prose lg:prose-xl">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
           <div className="flex items-center text-gray-500 text-sm mb-8">
            <span>By User #{blog.owner_id}</span>
            <span className="mx-2">•</span>
            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
          </div>
          <div className="whitespace-pre-wrap">{blog.content}</div>
        </article>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
