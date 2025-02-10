import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center p-8 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/auth/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200">
            Register
          </Link>
        </div>

        <p className="mt-8 text-sm text-center">
          Already have an account? <Link href="/auth/login" className="text-blue-500 hover:underline">Log in here</Link>.
        </p>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()}All rights reserved.
      </footer>
    </div>
  );
}