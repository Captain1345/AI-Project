// filepath: src/app/sign-up/page.js
import { SignUp } from "@clerk/nextjs";
import AfterSignUpSync from "./after-sign-up";

export default function SignUpPage() {
  return (
    <>
      <SignUp routing="hash"  forceRedirectUrl="/sign-up" />
      <AfterSignUpSync />
    </>
  );
}