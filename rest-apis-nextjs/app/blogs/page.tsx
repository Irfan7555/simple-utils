import Link from "next/link";
import { fetchBlogs } from "../lib/api";

export default async function BlogsPage() {
  const blogs = await fetchBlogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/blogs/${blog.id}`} className="hover:text-blue-600">
                {blog.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              <Link href={`/blogs/${blog.id}`} className="text-blue-500 hover:text-blue-700 font-medium">
                Read more
              </Link>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No blogs found.</p>
        )}
      </div>
    </div>
  );
}
