import VerificationForm from './components/VerificationForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 mb-8">
            Enter your certificate ID below to verify its authenticity
          </p>
        </div>
        
        <VerificationForm />

        <div className="mt-6 text-center text-sm text-gray-500">
          Need help? Contact our support team
        </div>
      </div>
    </main>
  );
}
