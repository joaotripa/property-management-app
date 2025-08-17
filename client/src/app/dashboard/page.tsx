"use client";

import { useRedirectIfSignedOut } from "@/hooks/use-redirect-if-signed-in-or-out";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  /*useRedirectIfSignedOut();
  const { data: session, status } = useSession();

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-3 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }*/

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground">
          Welcome! Manage your properties and track your finances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Properties
          </h2>
          <p className="text-gray-600">Manage your rental properties</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-blue-600">0</span>
            <span className="text-gray-500 ml-2">properties</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Monthly Income
          </h2>
          <p className="text-gray-600">Track your rental income</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">€0</span>
            <span className="text-gray-500 ml-2">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Expenses</h2>
          <p className="text-gray-600">Monitor your costs</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-red-600">€0</span>
            <span className="text-gray-500 ml-2">this month</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          Get Started
        </h2>
        <p className="text-blue-700 mb-4">
          Welcome to Domari! Start by adding your first property to begin
          tracking your rental finances.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Your First Property
        </button>
      </div>
    </div>
  );
}
