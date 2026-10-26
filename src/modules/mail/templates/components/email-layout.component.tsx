import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

type EmailLayoutProps = {
  previewText: string;
  footerText?: string;
  children: ReactNode;
};

const bodyStyle: CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 0',
};

const containerStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  maxWidth: '560px',
  padding: '32px',
};

const dividerStyle: CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '32px 0 16px',
};

const footerStyle: CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
};

export function EmailLayout({
  previewText,
  footerText,
  children,
}: EmailLayoutProps): ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {children}
          {footerText && (
            <>
              <Hr style={dividerStyle} />
              <Text style={footerStyle}>{footerText}</Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}
