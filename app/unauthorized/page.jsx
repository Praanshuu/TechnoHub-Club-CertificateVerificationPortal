export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-red-100">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Unauthorized</h1>
        <p className="mt-2 text-gray-700">
          You do not have permission to access this page.
        </p>
        <a href="/" className="text-blue-600 underline mt-4 inline-block">Go back to Home</a>
      </div>
    </div>
  );
}
