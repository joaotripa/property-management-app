import { DeleteAccountApiInput } from "@/lib/validations/user";

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

export class UserServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "UserServiceError";
  }
}

export async function deleteAccount(
  email: string
): Promise<DeleteAccountResponse> {
  try {
    const requestBody: DeleteAccountApiInput = { email };

    const response = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new UserServiceError(
        data.error || data.message || "Failed to delete account",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new UserServiceError(error.message);
    }

    throw new UserServiceError("An unexpected error occurred");
  }
}
