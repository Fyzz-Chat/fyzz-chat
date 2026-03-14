import { auth } from "@/auth";
import { TEST_PASSWORD, TEST_USER_EMAIL, TEST_USER_NAME } from "./test-user";

export async function ensureTestUser() {
  try {
    await auth.api.signUpEmail({
      body: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_PASSWORD,
        callbackURL: "/",
      },
    });
    console.log(`Created test user: ${TEST_USER_EMAIL}`);
  } catch {
    console.log(`Test user already exists: ${TEST_USER_EMAIL}`);
  }
}
