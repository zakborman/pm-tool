import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">PM Tool</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Real-time project management with collaboration
          </p>
          <p className="text-lg text-gray-500">
            Manage tasks, collaborate with your team, and track progress in real-time
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md border border-blue-600"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-gray-500">
            Built with Next.js, FastAPI, and WebSockets
          </p>
        </div>
      </div>
    </main>
  );
}
