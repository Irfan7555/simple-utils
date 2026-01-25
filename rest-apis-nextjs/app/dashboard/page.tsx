'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog } from '../lib/api';
import { useAuth } from '../lib/useAuth';

export default function Dashboard() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createBlog({ title, content, published });
      setTitle('');
      setContent('');
      router.refresh();
      alert('Blog created successfully');
    } catch {
      setError('You must be logged in to create a blog.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Create Blog</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="border p-2 w-full mb-4"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="border p-2 w-full mb-4"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Blog
          </button>
        </form>
      </div>
    </div>
  );
}
