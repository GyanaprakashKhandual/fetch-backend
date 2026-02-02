import { magicLinkTemplate } from './mail.verification.template';
import { oauthLinkTemplate } from './oauth.template';
import { otpVerificationTemplate } from './otp.verification.template';


export { welcomeEmailTemplate } from "./welcome.template";
export type { WelcomeEmailParams } from "./welcome.template";

export type { OTPEmailParams } from "./otp.verification.template";

export type { OAuthLinkEmailParams } from "./oauth.template";


export type { MagicLinkEmailParams } from "./magic-link.template";