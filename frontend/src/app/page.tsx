import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">PM Tool</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Real-time project management with collaboration
          </p>
          <p className="text-lg text-gray-400">
            Manage tasks, collaborate with your team, and track progress in real-time
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-gray-700 text-gray-200 px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl border border-gray-600"
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
