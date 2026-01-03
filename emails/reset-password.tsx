import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface MailProps {
  name: string;
  url: string;
}

export default function ResetPassword({ name, url }: MailProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#FF9F5F", // hsl(11.63 100% 68.63%)
              secondary: "#262021", // hsl(336 13.51% 14.51%) - dark mode background
              card: "#392f35", // hsl(324 9.62% 20.39%) - dark mode card
              text: "#e4e4e4", // hsl(21.43 35.00% 92.16%) - dark mode foreground
              muted: "#bcbcc5", // hsl(22.22 25.23% 79.02%) - dark mode muted foreground
              border: "#463a40", // hsl(325 9.38% 25.10%) - dark mode border
            },
          },
        },
      }}
    >
      <Html>
        <Head>
          <Font
            fontFamily="Montserrat"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body className="bg-secondary px-2 py-10 font-sans">
          <Container
            className="mx-auto max-w-[480px] border border-border bg-card p-0"
            style={{ borderRadius: "16px" }}
          >
            <Section className="border-border border-b bg-secondary/50 p-8">
              <Row align="center">
                <Column align="center">
                  <Img
                    src="https://raw.githubusercontent.com/Fyzz-Chat/fyzz-chat/refs/heads/main/src/app/icon.svg"
                    alt="Fyzz Chat"
                    width={36}
                    height={36}
                    className="inline-block align-middle"
                  />
                  <Text className="m-0 ml-2 inline-block align-middle font-semibold text-2xl text-white tracking-tight">
                    Fyzz Chat
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="p-8">
              <Heading className="mt-0 mb-4 font-medium text-text text-xl">
                Password Reset Request
              </Heading>
              <Text className="mb-6 text-[15px] text-text leading-7">
                Hi <strong>{name}</strong>,
              </Text>
              <Text className="mb-8 text-[15px] text-text leading-7">
                We received a request to reset your password for your Fyzz Chat account.
                Click the button below to proceed.
              </Text>

              <Section className="mb-8 text-center">
                <Button
                  href={url}
                  className="block w-auto px-8 py-3 font-semibold text-[15px]"
                  style={{
                    borderRadius: "12px",
                    color: "#ffffff",
                    backgroundColor: "#FF9F5F",
                    textDecoration: "none",
                  }}
                >
                  Reset Password
                </Button>
              </Section>

              <Text className="mb-4 text-[15px] text-text leading-7">
                If you didn't request this change, you can safely ignore this email. Your
                password will remain unchanged.
              </Text>

              <Hr className="my-8 border-border border-t" />

              <Text className="text-center text-muted text-xs leading-5">
                This link will expire in 24 hours.
                <br />
                <Link
                  href={url}
                  className="text-primary"
                  style={{ textDecoration: "underline", color: "#FF9F5F" }}
                >
                  {url}
                </Link>
              </Text>
            </Section>

            <Section className="border-border border-t bg-secondary/30 p-6 text-center">
              <Text className="m-0 text-muted text-xs">
                © {new Date().getFullYear()} Fyzz Chat. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

ResetPassword.PreviewProps = {
  name: "John Doe",
  url: "http://localhost:3000/reset-password?token=12345",
} as MailProps;
