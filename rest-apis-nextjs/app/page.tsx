import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">MyBlog</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            A modern platform to share your thoughts, ideas, and stories with the world. Built with Next.js and FastAPI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/blogs"
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Read Blogs
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-full bg-white text-slate-700 font-semibold text-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Start Writing
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Rich Content</h3>
            <p className="text-slate-600">Write beautiful articles with standard formatting and share them instantly.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-slate-600">Powered by Next.js and FastAPI for optimal performance and SEO.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure</h3>
            <p className="text-slate-600">JWT Authentication keeps your account and content safe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}