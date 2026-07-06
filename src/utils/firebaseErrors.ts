/**
 * Helper utility to map Firebase authentication error codes and messages
 * to friendly, user-facing error text.
 */
export function getFriendlyErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";

  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("auth/invalid-credential")) {
    return "Account does not exist or incorrect password. Please try again.";
  }
  if (message.includes("auth/user-not-found")) {
    return "Account does not exist. Please sign up instead.";
  }
  if (message.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (message.includes("auth/user-disabled")) {
    return "This account has been disabled. Please contact support.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Too many failed login attempts. Access has been temporarily blocked. Please reset your password or try again later.";
  }
  if (message.includes("auth/email-already-in-use")) {
    return "An account already exists with this email address.";
  }
  if (message.includes("auth/weak-password")) {
    return "Password is too weak. Please choose a stronger password.";
  }
  if (message.includes("auth/popup-closed-by-user")) {
    return "Sign-in popup was closed before completion.";
  }
  if (message.includes("auth/requires-recent-login")) {
    return "Please log out and log back in to perform this security operation.";
  }

  // Strip "Firebase: " prefix if present to make standard errors cleaner
  return message.replace(/^Firebase:\s*/i, "");
}
