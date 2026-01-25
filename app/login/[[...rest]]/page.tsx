"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back. Please sign in to continue.
          </p>
        </div>

        {/* Clerk */}
        <div className="px-8 pb-8 pt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",

                socialButtonsBlockButton:
                  "border border-gray-200 rounded-md hover:bg-gray-50 transition",
                socialButtonsBlockButtonText:
                  "text-sm font-medium text-gray-700",

                dividerLine: "bg-gray-200",
                dividerText: "text-gray-400 text-xs",

                formFieldLabel: "text-sm font-medium text-gray-700",
                formFieldInput:
                  "h-11 border border-gray-300 rounded-md px-3 text-sm focus:ring-2 focus:ring-[#6c47ff] focus:border-[#6c47ff]",
                formButtonPrimary:
                  "h-11 bg-[#6c47ff] hover:bg-[#5b3ee6] text-sm font-medium rounded-md transition",

                footerActionText: "text-sm text-gray-500",
                footerActionLink:
                  "text-sm font-medium text-[#6c47ff] hover:underline",

                footer: "hidden",
              },
            }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
