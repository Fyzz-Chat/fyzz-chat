import ResetPassword from "@/../emails/reset-password";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID is not set.");
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is not set.");
}

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

const client = new SESClient({ region: "eu-central-1" });

type SendResetPasswordEmailProps = {
  to: string;
  name: string;
  url: string;
};

export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: SendResetPasswordEmailProps) {
  const body = await render(<ResetPassword name={name} url={url} />);

  const command: SendEmailCommand = new SendEmailCommand({
    Source: "noreply@fyzz.chat",
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: "Fyzz.chat - Reset your password",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
      },
    },
  });

  try {
    const data = await client.send(command);

    return data;
  } catch (error) {
    console.error(error);
    throw new EmailError("Failed to send email.");
  }
}
