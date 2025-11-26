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
        <Body className="bg-secondary font-sans py-10 px-2">
          <Container
            className="bg-card border border-border mx-auto p-0 max-w-[480px]"
            style={{ borderRadius: "16px" }}
          >
            <Section className="bg-secondary/50 p-8 border-b border-border">
              <Row align="center">
                <Column align="center">
                  <Img
                    src="https://raw.githubusercontent.com/Fyzz-Chat/fyzz-chat/refs/heads/main/src/app/icon.svg"
                    alt="Fyzz Chat"
                    width={36}
                    height={36}
                    className="inline-block align-middle"
                  />
                  <Text className="text-2xl font-semibold text-white m-0 ml-2 inline-block align-middle tracking-tight">
                    Fyzz Chat
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="p-8">
              <Heading className="text-xl font-medium text-text mb-4 mt-0">
                Password Reset Request
              </Heading>
              <Text className="text-text text-[15px] leading-7 mb-6">
                Hi <strong>{name}</strong>,
              </Text>
              <Text className="text-text text-[15px] leading-7 mb-8">
                We received a request to reset your password for your Fyzz Chat account.
                Click the button below to proceed.
              </Text>

              <Section className="text-center mb-8">
                <Button
                  href={url}
                  className="font-semibold text-[15px] px-8 py-3 block w-auto"
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

              <Text className="text-text text-[15px] leading-7 mb-4">
                If you didn't request this change, you can safely ignore this email. Your
                password will remain unchanged.
              </Text>

              <Hr className="border-t border-border my-8" />

              <Text className="text-muted text-xs text-center leading-5">
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

            <Section className="bg-secondary/30 p-6 text-center border-t border-border">
              <Text className="text-muted text-xs m-0">
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
