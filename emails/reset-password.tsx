import {
    Body,
    Container,
    Font,
    Head,
    Heading,
    Hr,
    Html,
    Tailwind,
    Text,
    Button,
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
                primary: "#000000",
                muted: "#c7c7c7",
              },
            },
          },
        }}
      >
        <Html>
          <Head>
            <Font
              fontFamily="Inter"
              fallbackFontFamily="Arial"
              webFont={{
                url: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ8UA3.woff2",
                format: "woff2",
              }}
            />
          </Head>
          <Body className="text-primary bg-primary py-6">
            <Container className="p-6 mx-auto bg-white rounded-lg">
              <Heading className="text-center">Reset your password</Heading>
              <Text>
                Hi, <b>{name}!</b>
              </Text>
              <Hr className="my-[16px] border-t-2 border-muted w-[90%]" />
              <Text>Click the button below to reset your password:</Text>
              <Button href={url}>Reset Password</Button>
            </Container>
          </Body>
        </Html>
      </Tailwind>
    );
  }
  
  ResetPassword.PreviewProps = {
    name: "John Doe",
    url: "http://localhost:3000/reset-password/request",
  } as MailProps;
