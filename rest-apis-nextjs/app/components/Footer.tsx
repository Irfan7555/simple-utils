import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} <span className="font-semibold text-slate-800">MyBlog</span>. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Privacy
            </Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              GitHub
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
